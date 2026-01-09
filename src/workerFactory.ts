export type WorkerFactoryProps = {
  uuid?: string;
  shared_worker?: boolean;
  worker?: Worker | SharedWorker;
};

export const shouldPreferInlineWorkers = ({
  pageOrigin,
  scriptUrl,
}: {
  pageOrigin: string | undefined;
  scriptUrl: string | undefined;
}): boolean => {
  if (!pageOrigin || !scriptUrl) return false;
  try {
    return new URL(scriptUrl).origin !== pageOrigin;
  } catch {
    return false;
  }
};
