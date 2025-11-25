export type AIResponse = {
  layout_type: "split" | "linear" | "radial";
  root_node: {
    label: string;
    note?: string;
  };
  branches: {
    id: string;
    label: string; // Max 4-5 words
    parent_id: string; // "root" or another branch ID
    keywords: string[]; // Exact terms for the 'Detector' feature
    details?: string[]; // 2-3 specific definitions or steps
    exam_tip?: string; // A short "Pro Tip" for scoring marks
    type: "main_point" | "sub_point" | "example";
  }[];
};
