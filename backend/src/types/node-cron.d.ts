declare module 'node-cron' {
  interface ScheduledTask {
    stop(): void;
    start(): void;
  }
  function schedule(expression: string, func: () => void | Promise<void>): ScheduledTask;
  export default { schedule };
}
