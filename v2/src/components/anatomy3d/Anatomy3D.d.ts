import type { ComponentType } from 'react';

export interface AnatomyStructure {
  id: string;
  label: string;
  type: string;
  laterality?: 'paired' | 'midline';
}

export interface Anatomy3DProps {
  /** Structure id to open on (from content `loads` / `structures`). */
  focus?: string;
  /** Adds a primary action for the selected structure. */
  onPick?: (structure: AnatomyStructure, side?: 'L' | 'R' | 'M') => void;
  pickLabel?: string;
  pickedId?: string;
  /** Where manifest.json and models/ are served from. */
  base?: string;
}

declare const Anatomy3D: ComponentType<Anatomy3DProps>;
export default Anatomy3D;
