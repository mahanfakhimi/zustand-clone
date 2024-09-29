import createStore from "./createStore";

type State = {
  count: number;
};

type Actions = {
  increment: (payload: number) => void;
  decrement: (payload: number) => void;
  reset: () => void;
};

const useGlobalStore = createStore<State & Actions>((set) => ({
  count: 0,
  users: [],
  increment: (payload) => set((state) => ({ count: state.count + payload })),
  decrement: (payload) => set((state) => ({ count: state.count - payload })),
  reset: () => set({ count: 0 }),
}));

useGlobalStore.setState({ count: 10 });

useGlobalStore.subscribe((prevState, nextState) => {
  console.log(prevState.count, nextState.count);
});

const Counter = () => {
  const { count, increment, decrement, reset } = useGlobalStore();

  return (
    <div>
      <button onClick={() => increment(1)}>increment</button>
      <button onClick={() => decrement(1)}>decrement</button>
      <button onClick={reset}>reset</button>
      <h1>{count}</h1>
    </div>
  );
};

const App = () => {
  return (
    <div>
      <Counter />
      <Counter />
      <Counter />
    </div>
  );
};

export default App;
