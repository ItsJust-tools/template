'use client';

import React, { useState, useEffect } from 'react';
import { YamlToJsonToolDefinition } from '@/tool/tool-definition';
import { ToolState } from '@/tool/types';
import { Sidebar } from '@/tool/components/Sidebar';
import { Toolbar } from '@/tool/components/Toolbar';
import { Canvas } from '@/tool/components/Canvas';

const def = new YamlToJsonToolDefinition();

export default function ToolClient() {
  const [state, setState] = useState<ToolState>(() => def.initialState);

  useEffect(() => {
    if (state.autoConvert) {
      const converted = def.convert(state);
      if (converted.output !== state.output || converted.error !== state.error) {
        setState(converted);
      }
    }
  }, [state.input, state.mode, state.indent, state.autoConvert]);

  const handleStateChange = (newState: ToolState) => {
    setState(newState);
  };

  const handleConvert = () => {
    setState(def.convert(state));
  };

  const handleClear = () => {
    setState({ ...state, input: '', output: '', error: null });
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      <div className="w-64 flex-shrink-0">
        <Sidebar onChange="{handleStateChange}" state="{state}"/>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <Toolbar
 onChange="{handleStateChange}
" onClear="{handleClear}
" onConvert="{handleConvert}
" state="{state}
"/>
        <Canvas onChange="{handleStateChange}" state="{state}"/>
      </div>
    </div>
  );
}
