import { useSyncExternalStore } from "react";

type StateUpdate<State> = Partial<State> | ((state: State) => Partial<State>);
type UpdateStateFunction<State> = (state: StateUpdate<State>) => void;
type StateInitializer<State> = (set: UpdateStateFunction<State>) => State;
type Listener = () => void;
type SelectorFunction<State, Selected> = (state: State) => Selected;

class Store<State> {
  private listeners: Listener[] = [];
  private prevState: State;

  constructor(private state: State) {
    this.prevState = state;
  }

  subscribe(listener: Listener, callImmediately = false) {
    if (callImmediately) listener();

    this.listeners = [...this.listeners, listener];

    return () =>
      (this.listeners = this.listeners.filter((l) => l !== listener));
  }

  getPrevState() {
    return this.prevState;
  }

  getSnapshot() {
    return this.state;
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  setState(newState: StateUpdate<State>) {
    this.prevState = this.state;

    this.state =
      typeof newState === "function"
        ? { ...this.state, ...newState(this.state) }
        : { ...this.state, ...newState };

    this.notifyListeners();
  }
}

const createStore = <State>(initializer: StateInitializer<State>) => {
  const store = new Store(initializer((newState) => store.setState(newState)));

  const useStore = <Selected = State>(
    selector?: SelectorFunction<State, Selected>
  ) => {
    const state = useSyncExternalStore(
      store.subscribe.bind(store),
      store.getSnapshot.bind(store)
    );

    return selector ? selector(state) : (state as unknown as Selected);
  };

  useStore.getState = () => store.getSnapshot();

  useStore.setState = (newState: StateUpdate<State>) =>
    store.setState(newState);

  useStore.subscribe = (
    callback: (prevState: State, nextState: State) => void,
    callImmediately = true
  ) =>
    store.subscribe(
      () => callback(store.getPrevState()!, store.getSnapshot()),
      callImmediately
    );

  return useStore;
};

export default createStore;
