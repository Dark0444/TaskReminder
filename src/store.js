import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as N from './notifications';
import { nextOccurrence } from './nlp';
import { setHapticsEnabled } from './haptics';

const KEY = 'tr.v2';
const OLD_KEY = 'tasks';
const RESP_KEY = 'tr.lastResponse';

export const defaultSettings = {
  theme: 'auto',
  summaryEnabled: false,
  summaryHour: 8,
  summaryMinute: 0,
  summaryId: null,
  defaultAlerts: [0],
  haptics: true,
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const PRIORITY_MAP = { alta: 'high', media: 'med', baja: 'low', high: 'high', med: 'med', low: 'low' };

function normalizeTask(t) {
  const due = t.due || t.reminderTime || t.dueDate || t.date || null;
  const dueOk = due && !Number.isNaN(new Date(due).getTime()) ? new Date(due).toISOString() : null;
  return {
    id: String(t.id || uid()),
    title: String(t.title || 'Sin título'),
    notes: String(t.notes || t.description || ''),
    priority: PRIORITY_MAP[t.priority] || 'med',
    category: t.category || 'personal',
    due: dueOk,
    repeat: ['daily', 'weekly', 'monthly'].includes(t.repeat) ? t.repeat : 'none',
    alerts: Array.isArray(t.alerts) && t.alerts.length ? t.alerts : [0],
    done: !!(t.done || t.completed),
    doneAt: t.doneAt || null,
    doneCount: t.doneCount || 0,
    createdAt: t.createdAt || new Date().toISOString(),
    notifIds: [],
  };
}

const initial = { ready: false, tasks: [], settings: defaultSettings };

function reducer(s, a) {
  switch (a.type) {
    case 'load':
      return { ready: true, tasks: a.tasks, settings: a.settings };
    case 'upsert': {
      const exists = s.tasks.some((t) => t.id === a.task.id);
      return {
        ...s,
        tasks: exists ? s.tasks.map((t) => (t.id === a.task.id ? a.task : t)) : [a.task, ...s.tasks],
      };
    }
    case 'patch':
      return { ...s, tasks: s.tasks.map((t) => (t.id === a.id ? { ...t, ...a.patch } : t)) };
    case 'remove':
      return { ...s, tasks: s.tasks.filter((t) => t.id !== a.id) };
    case 'replace':
      return { ...s, tasks: a.tasks };
    case 'settings':
      return { ...s, settings: { ...s.settings, ...a.patch } };
    default:
      return s;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const ref = useRef(state);
  ref.current = state;

  const api = useMemo(() => {
    const find = (id) => ref.current.tasks.find((t) => t.id === id);

    const reschedule = (task) => {
      N.scheduleForTask(task)
        .then((ids) => dispatch({ type: 'patch', id: task.id, patch: { notifIds: ids } }))
        .catch(() => {});
    };

    return {
      addTask(input) {
        const s = ref.current.settings;
        const task = normalizeTask({
          ...input,
          id: uid(),
          alerts: input.alerts || s.defaultAlerts,
          createdAt: new Date().toISOString(),
        });
        dispatch({ type: 'upsert', task });
        reschedule(task);
        return task;
      },
      updateTask(id, patch) {
        const cur = find(id);
        if (!cur) return;
        const next = { ...cur, ...patch };
        dispatch({ type: 'upsert', task: next });
        reschedule(next);
      },
      toggleTask(id) {
        const cur = find(id);
        if (!cur) return;
        const nowIso = new Date().toISOString();
        let next;
        if (!cur.done && cur.repeat !== 'none' && cur.due) {
          const nd = nextOccurrence(cur.due, cur.repeat);
          next = { ...cur, due: nd ? nd.toISOString() : cur.due, doneAt: nowIso, doneCount: cur.doneCount + 1 };
        } else if (!cur.done) {
          next = { ...cur, done: true, doneAt: nowIso, doneCount: cur.doneCount + 1 };
        } else {
          next = { ...cur, done: false };
        }
        dispatch({ type: 'upsert', task: next });
        reschedule(next);
      },
      async snoozeTask(id, minutes) {
        const cur = find(id);
        if (!cur) return;
        const nid = await N.snooze(cur, minutes);
        if (nid) {
          const latest = find(id) || cur;
          dispatch({ type: 'patch', id, patch: { notifIds: [...(latest.notifIds || []), nid] } });
        }
      },
      deleteTask(id) {
        const cur = find(id);
        if (cur) N.cancelIds(cur.notifIds);
        dispatch({ type: 'remove', id });
      },
      clearDone() {
        ref.current.tasks
          .filter((t) => t.done)
          .forEach((t) => {
            N.cancelIds(t.notifIds);
            dispatch({ type: 'remove', id: t.id });
          });
      },
      updateSettings(patch) {
        dispatch({ type: 'settings', patch });
        const merged = { ...ref.current.settings, ...patch };
        if ('haptics' in patch) setHapticsEnabled(merged.haptics);
        const summaryKeys = ['summaryEnabled', 'summaryHour', 'summaryMinute'];
        if (summaryKeys.some((k) => k in patch)) {
          N.scheduleSummary(merged).then((id) =>
            dispatch({ type: 'settings', patch: { summaryId: id } })
          );
        }
      },
      exportData() {
        const { tasks, settings } = ref.current;
        return JSON.stringify(
          {
            app: 'task-reminder',
            version: 2,
            exportedAt: new Date().toISOString(),
            tasks: tasks.map((t) => ({ ...t, notifIds: [] })),
            settings: { ...settings, summaryId: null },
          },
          null,
          2
        );
      },
      async importData(text) {
        const data = JSON.parse(text);
        const list = Array.isArray(data) ? data : data.tasks;
        if (!Array.isArray(list)) throw new Error('El texto no contiene tareas.');
        await N.cancelAll();
        const tasks = list.map(normalizeTask);
        dispatch({ type: 'replace', tasks });
        if (data.settings && typeof data.settings === 'object') {
          dispatch({ type: 'settings', patch: { ...data.settings, summaryId: null } });
        }
        tasks.forEach((t) => reschedule(t));
        return tasks.length;
      },
    };
  }, []);

  // Carga inicial (con migración de la versión anterior de la app)
  useEffect(() => {
    let alive = true;
    (async () => {
      await N.setupNotifications();
      let tasks = [];
      let settings = defaultSettings;
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const p = JSON.parse(raw);
          tasks = (p.tasks || []).map(normalizeTask).map((t, i) => ({
            ...t,
            notifIds: (p.tasks[i] && p.tasks[i].notifIds) || [],
          }));
          settings = { ...defaultSettings, ...(p.settings || {}) };
        } else {
          const old = await AsyncStorage.getItem(OLD_KEY);
          if (old) {
            const list = JSON.parse(old);
            if (Array.isArray(list)) tasks = list.map(normalizeTask);
          }
        }
      } catch (e) {
        // datos ilegibles: empezamos limpio
      }
      if (!alive) return;
      setHapticsEnabled(settings.haptics);
      dispatch({ type: 'load', tasks, settings });
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Guardado automático
  useEffect(() => {
    if (!state.ready) return;
    const id = setTimeout(() => {
      AsyncStorage.setItem(
        KEY,
        JSON.stringify({ tasks: state.tasks, settings: state.settings })
      ).catch(() => {});
    }, 250);
    return () => clearTimeout(id);
  }, [state.ready, state.tasks, state.settings]);

  // Botones de las notificaciones (Completar / Posponer)
  useEffect(() => {
    if (!state.ready) return undefined;
    let alive = true;
    const handle = async (resp) => {
      try {
        if (!resp || !resp.notification) return;
        const req = resp.notification.request;
        const key = `${req.identifier}|${resp.actionIdentifier}|${resp.notification.date}`;
        const last = await AsyncStorage.getItem(RESP_KEY);
        if (last === key) return;
        await AsyncStorage.setItem(RESP_KEY, key);
        const data = (req.content && req.content.data) || {};
        const task = ref.current.tasks.find((t) => t.id === data.taskId);
        if (!task) return;
        if (resp.actionIdentifier === 'done') {
          if (!task.done) api.toggleTask(task.id);
        } else if (resp.actionIdentifier === 'snooze10') {
          api.snoozeTask(task.id, 10);
        } else if (resp.actionIdentifier === 'snooze60') {
          api.snoozeTask(task.id, 60);
        }
      } catch (e) {
        // ignorar
      }
    };
    const sub = Notifications.addNotificationResponseReceivedListener(handle);
    Notifications.getLastNotificationResponseAsync()
      .then((r) => {
        if (alive && r) handle(r);
      })
      .catch(() => {});
    return () => {
      alive = false;
      sub.remove();
    };
  }, [state.ready, api]);

  const value = useMemo(() => ({ ...state, ...api }), [state, api]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
