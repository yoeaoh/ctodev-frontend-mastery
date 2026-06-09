import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Zap, Trash2, Plus, AlertCircle, Info } from 'lucide-react';

interface MapProperty {
  name: string;
  offset: string;
}

interface HiddenMap {
  id: string;
  properties: MapProperty[];
  isDictionary: boolean;
  transitionSource?: string;
}

export const HiddenClassTransitions: React.FC = () => {
  const [obj, setObj] = useState<Record<string, any>>({});
  const [maps, setMaps] = useState<HiddenMap[]>([
    { id: 'Map0', properties: [], isDictionary: false }
  ]);
  const [currentMapIndex, setCurrentMapIndex] = useState(0);

  const addProperty = (prop: string) => {
    if (maps[currentMapIndex].isDictionary) {
      setObj(prev => ({ ...prev, [prop]: Math.floor(Math.random() * 100) }));
      return;
    }

    if (obj.hasOwnProperty(prop)) return;

    const nextObj = { ...obj, [prop]: Math.floor(Math.random() * 100) };
    setObj(nextObj);

    const newMapId = `Map${maps.length}`;
    const newMap: HiddenMap = {
      id: newMapId,
      properties: [
        ...maps[currentMapIndex].properties,
        { name: prop, offset: `0x${(maps[currentMapIndex].properties.length * 8 + 16).toString(16)}` }
      ],
      isDictionary: false,
      transitionSource: maps[currentMapIndex].id
    };

    setMaps(prev => [...prev, newMap]);
    setCurrentMapIndex(maps.length);
  };

  const deleteProperty = (prop: string) => {
    const { [prop]: deleted, ...rest } = obj;
    setObj(rest);

    // Any delete operation in V8 usually transitions the object to Dictionary mode
    const newMapId = `Map${maps.length}_Dict`;
    const newMap: HiddenMap = {
      id: newMapId,
      properties: Object.keys(rest).map((p, i) => ({ name: p, offset: 'N/A (Hash)' })),
      isDictionary: true,
      transitionSource: maps[currentMapIndex].id
    };

    setMaps(prev => [...prev, newMap]);
    setCurrentMapIndex(maps.length);
  };

  const reset = () => {
    setObj({});
    setMaps([{ id: 'Map0', properties: [], isDictionary: false }]);
    setCurrentMapIndex(0);
  };

  const currentMap = maps[currentMapIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls & Object State */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap size={16} className="text-yellow-500" />
            Live Object
          </h4>
          <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm border border-zinc-800 min-h-[100px]">
            <span className="text-zinc-500">const obj = </span>
            <pre className="text-indigo-300 mt-2">
              {JSON.stringify(obj, null, 2)}
            </pre>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {['x', 'y', 'z', 'id'].map(p => (
                <button
                  key={p}
                  onClick={() => addProperty(p)}
                  disabled={obj.hasOwnProperty(p)}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-medium border border-zinc-700"
                >
                  <Plus size={14} /> add .{p}
                </button>
              ))}
            </div>
            <button
              onClick={reset}
              className="w-full py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-medium"
            >
              Reset Object
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex gap-3 items-start">
            <Info className="text-blue-400 shrink-0 mt-1" size={18} />
            <div className="text-xs text-zinc-400 leading-relaxed">
              <p className="font-bold text-zinc-300 mb-1">How it works:</p>
              Adding properties in a consistent order allows V8 to share "Hidden Classes" (Maps) between objects. 
              Using <code className="text-red-400">delete</code> breaks the chain and forces the object into <strong>Dictionary Mode</strong> (slow).
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Class Visualization */}
      <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col">
        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Layers size={16} className="text-indigo-500" />
          Internal Map Store (Hidden Classes)
        </h4>

        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMap.id}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0, y: -20 }}
              className={`w-full max-w-md p-6 rounded-2xl border-2 shadow-2xl ${
                currentMap.isDictionary 
                ? "bg-red-500/5 border-red-500/40" 
                : "bg-indigo-500/5 border-indigo-500/40"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest mb-1 inline-block ${
                    currentMap.isDictionary ? "bg-red-500 text-white" : "bg-indigo-500 text-white"
                  }`}>
                    {currentMap.isDictionary ? "Dictionary Mode" : "Fast Mode"}
                  </span>
                  <h5 className="text-2xl font-mono font-bold text-zinc-100">{currentMap.id}</h5>
                </div>
                {currentMap.transitionSource && (
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 font-bold block uppercase">Transition From</span>
                    <span className="text-xs font-mono text-zinc-400">{currentMap.transitionSource}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {currentMap.properties.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 italic text-sm border border-dashed border-zinc-800 rounded-lg">
                    Empty Descriptor Array
                  </div>
                ) : (
                  currentMap.properties.map((prop) => (
                    <motion.div
                      key={prop.name}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 group-hover:shadow-[0_0_8px_rgba(99,102,241,1)]" />
                        <span className="font-mono text-sm text-zinc-200">.{prop.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xs text-zinc-500">{prop.offset}</span>
                        {!currentMap.isDictionary && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProperty(prop.name);
                            }}
                            className="p-1.5 rounded-md hover:bg-red-500/20 text-zinc-600 hover:text-red-400 transition-colors"
                            title="Delete property"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {currentMap.isDictionary && (
                <div className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-3">
                  <AlertCircle className="text-red-400 shrink-0" size={16} />
                  <p className="text-[11px] text-red-200/70 leading-relaxed">
                    <strong>Bailout!</strong> The object was converted to a dictionary. 
                    Offsets are no longer predictable. Hash lookups will be used, resulting in significantly slower property access.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Map History/Timeline */}
          <div className="mt-8 flex gap-2 overflow-x-auto w-full pb-2 px-2 scrollbar-thin scrollbar-thumb-zinc-800">
            {maps.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => setCurrentMapIndex(idx)}
                className={`shrink-0 px-3 py-1.5 rounded-lg font-mono text-[10px] border transition-all ${
                  idx === currentMapIndex
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                }`}
              >
                {m.id}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
