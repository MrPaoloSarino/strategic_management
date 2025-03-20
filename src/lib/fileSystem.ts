interface StrategicData {
  swot: {
    strengths: Array<{ id: string; description: string }>;
    weaknesses: Array<{ id: string; description: string }>;
    opportunities: Array<{ id: string; description: string }>;
    threats: Array<{ id: string; description: string }>;
  };
  matrices: {
    ife: Array<{ id: string; description: string; weight: number; rating: number }>;
    efe: Array<{ id: string; description: string; weight: number; rating: number }>;
  };
  ksf: Array<{
    id: string;
    description: string;
    target: string;
    measure: string;
    weight: number;
    performance: number;
  }>;
}

let activeFileHandle: FileSystemFileHandle | null = null;

export const saveToFile = async (data: StrategicData): Promise<{ success: boolean; handle: FileSystemFileHandle | null }> => {
  try {
    // If we have an active file handle, use it; otherwise, show the save picker
    const handle = activeFileHandle || await window.showSaveFilePicker({
      suggestedName: 'strategic-analysis.json',
      types: [{
        description: 'JSON File',
        accept: {
          'application/json': ['.json'],
        },
      }],
    });

    // Create a FileSystemWritableFileStream to write to
    const writable = await handle.createWritable();

    // Write the contents
    await writable.write(JSON.stringify(data, null, 2));

    // Close the file and write the contents to disk
    await writable.close();

    // Store the handle for future auto-saves
    activeFileHandle = handle;

    return { success: true, handle };
  } catch (err) {
    console.error('Error saving file:', err);
    return { success: false, handle: null };
  }
};

export const loadFromFile = async (): Promise<{ data: StrategicData | null; handle: FileSystemFileHandle | null }> => {
  try {
    // Get the file handle
    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: 'JSON File',
        accept: {
          'application/json': ['.json'],
        },
      }],
      multiple: false,
    });

    // Get the file contents
    const file = await handle.getFile();
    const contents = await file.text();
    const data = JSON.parse(contents) as StrategicData;

    // Store the handle for future auto-saves
    activeFileHandle = handle;

    return { data, handle };
  } catch (err) {
    console.error('Error loading file:', err);
    return { data: null, handle: null };
  }
};

// Auto-save functionality with debouncing
let autoSaveTimeout: number | null = null;

export const autoSave = async (data: StrategicData): Promise<void> => {
  if (!activeFileHandle) return;

  // Clear any pending auto-save
  if (autoSaveTimeout) {
    window.clearTimeout(autoSaveTimeout);
  }

  // Set up new auto-save with 2-second delay
  autoSaveTimeout = window.setTimeout(async () => {
    try {
      const writable = await activeFileHandle!.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
      console.log('Auto-saved successfully');
    } catch (err) {
      console.error('Error auto-saving:', err);
    }
  }, 2000);
};

export const hasActiveFile = (): boolean => {
  return activeFileHandle !== null;
};
