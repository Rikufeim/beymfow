import React from "react";

type ToastMethod = (...args: unknown[]) => void;

const noop: ToastMethod = () => {};

// Shared no-op toast implementation so notifications stay silent.
export const toast = Object.assign(noop, {
  success: noop,
  error: noop,
  info: noop,
  warning: noop,
  message: noop,
  dismiss: noop,
  promise: (..._args: unknown[]) => Promise.resolve<void>(undefined),
});

export const Toaster: React.FC = () => null;

