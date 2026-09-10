import { RawModelData, HfTags } from '../types/model';

/**
 * OOP Entity Class representing a machine learning model.
 * Encapsulates model data, normalization, and evaluation logic.
 */
export class Model {
  public readonly id: string;
  public readonly displayName: string;
  public readonly huggingfaceRepo: string;
  public readonly repoUrl: string;
  public readonly family: string;
  public readonly authorNamespace: string;
  public readonly architectureCategory: string;
  public readonly useCase: string;
  public readonly pytorchArchitecture: string;
  public readonly weightFormat: string;
  public readonly safetensorFileCount: number;
  public readonly rawSafetensorCountString: string;
  public readonly cliDownloadCommand: string;
  public readonly hfTags: HfTags;
  public readonly allTags: string[];

  constructor(data: RawModelData) {
    this.id = data.id || '';
    this.displayName = data.display_name || data.id || '';
    this.huggingfaceRepo = data.huggingface_repo || '';
    this.repoUrl = data.repo_url || '';
    this.family = data.family || 'Unknown';
    this.authorNamespace = data.author_namespace || '';
    this.architectureCategory = data.architecture_category || 'Dense';
    this.useCase = data.use_case || '';
    this.pytorchArchitecture = data.pytorch_architecture || '';
    this.weightFormat = data.weight_format || '';
    this.cliDownloadCommand = data.cli_download_command || '';
    this.hfTags = data.hf_tags || {};

    // Safetensor count parser (handles strings like "201", numbers, and "TBD")
    const rawCountStr = String(data.safetensor_file_count || '').trim();
    this.rawSafetensorCountString = rawCountStr;
    const parsedNum = parseInt(rawCountStr, 10);
    this.safetensorFileCount = Number.isNaN(parsedNum) ? 0 : parsedNum;

    // Collect all unique normalized tags
    const tagsSet = new Set<string>();
    if (this.hfTags.pipeline_tag) tagsSet.add(this.hfTags.pipeline_tag.toLowerCase());
    if (Array.isArray(this.hfTags.all_tags)) {
      this.hfTags.all_tags.forEach((t) => tagsSet.add(t.toLowerCase()));
    }
    if (Array.isArray(this.hfTags.architecture)) {
      this.hfTags.architecture.forEach((t) => tagsSet.add(t.toLowerCase()));
    }
    if (Array.isArray(this.hfTags.quantization)) {
      this.hfTags.quantization.forEach((t) => tagsSet.add(t.toLowerCase()));
    }
    this.allTags = Array.from(tagsSet);
  }

  /**
   * Evaluates substring search from start or middle across configured field.
   */
  public matchesSearch(query: string, field: 'all' | 'name' | 'family' = 'all'): boolean {
    if (!query || query.trim() === '') return true;
    const cleanQuery = query.toLowerCase().trim();

    if (field === 'name') {
      return (
        this.displayName.toLowerCase().includes(cleanQuery) ||
        this.id.toLowerCase().includes(cleanQuery)
      );
    }

    if (field === 'family') {
      return this.family.toLowerCase().includes(cleanQuery);
    }

    // Default 'all': matches name or family
    return (
      this.displayName.toLowerCase().includes(cleanQuery) ||
      this.id.toLowerCase().includes(cleanQuery) ||
      this.family.toLowerCase().includes(cleanQuery)
    );
  }

  /**
   * Checks if model satisfies pipeline tags
   */
  public matchesPipelineTag(selectedTags: string[]): boolean {
    if (!selectedTags || selectedTags.length === 0) return true;
    const pipeline = (this.hfTags.pipeline_tag || '').toLowerCase();
    return selectedTags.some((tag) => pipeline === tag.toLowerCase());
  }

  /**
   * Checks if model matches any selected family tag
   */
  public matchesFamilyTag(selectedTags: string[]): boolean {
    if (!selectedTags || selectedTags.length === 0) return true;
    return selectedTags.some((tag) => this.family.toLowerCase() === tag.toLowerCase());
  }

  /**
   * Checks if model matches selected architecture tags
   */
  public matchesArchitectureTag(selectedTags: string[]): boolean {
    if (!selectedTags || selectedTags.length === 0) return true;
    const archs = (this.hfTags.architecture || []).map((a) => a.toLowerCase());
    archs.push(this.architectureCategory.toLowerCase());
    return selectedTags.some((tag) => archs.includes(tag.toLowerCase()));
  }

  /**
   * Checks if model matches selected weight tags
   */
  public matchesWeightTag(selectedTags: string[]): boolean {
    if (!selectedTags || selectedTags.length === 0) return true;
    const weightLower = this.weightFormat.toLowerCase();
    const quantLower = (this.hfTags.quantization || []).map((q) => q.toLowerCase());
    return selectedTags.some(
      (tag) => weightLower.includes(tag.toLowerCase()) || quantLower.includes(tag.toLowerCase())
    );
  }

  /**
   * Checks if model safetensor count falls within specified [min, max] range
   */
  public matchesSafetensorRange(min: number, max: number): boolean {
    return this.safetensorFileCount >= min && this.safetensorFileCount <= max;
  }
}
