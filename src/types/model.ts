export interface HfTags {
  pipeline_tag?: string;
  framework?: string[];
  license?: string[];
  quantization?: string[];
  architecture?: string[];
  task_domain?: string[];
  modality?: string[];
  application?: string[];
  adapter_finetune?: string[];
  safety_policy?: string[];
  inference_serving?: string[];
  all_tags?: string[];
}

export interface RawModelData {
  id: string;
  display_name: string;
  huggingface_repo: string;
  repo_url: string;
  family: string;
  author_namespace: string;
  architecture_category: string;
  use_case: string;
  pytorch_architecture: string;
  weight_format: string;
  safetensor_file_count: string | number;
  cli_download_command: string;
  hf_tags: HfTags;
  hf_query_examples?: string[];
}

export interface FilterCriteria {
  searchQuery: string;
  searchField: 'all' | 'name' | 'family';
  pipelineTags: string[];
  familyTags: string[];
  architectureTags: string[];
  weightTags: string[];
  safetensorMin: number;
  safetensorMax: number;
}

export type SortOption =
  | 'safetensor_desc'
  | 'safetensor_asc'
  | 'name_asc'
  | 'name_desc';

export interface UserSavedSelection {
  id: string;
  modelId: string;
  modelName: string;
  savedAt: string;
  notes?: string;
  priority?: 'High' | 'Medium' | 'Low';
}
