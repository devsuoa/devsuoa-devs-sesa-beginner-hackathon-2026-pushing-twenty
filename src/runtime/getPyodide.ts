let pyodidePromise: Promise<any> | null = null;

export function getPyodide(): Promise<any> {
  if (!pyodidePromise) {
    pyodidePromise = window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/",
    });
  }
  return pyodidePromise;
}