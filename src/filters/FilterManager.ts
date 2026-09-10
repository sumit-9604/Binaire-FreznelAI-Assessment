import { Model } from '../models/Model';
import { FilterCriteria } from '../types/model';

export interface AvailableFilterOptions {
  pipelineTags: string[];
  familyTags: string[];
  architectureTags: string[];
  weightTags: string[];
  safetensorBoundMin: number;
  safetensorBoundMax: number;
}

/**
 * FilterManager Class
 * Implements filtering across Pipeline tags, Family tags, Architecture tags,
 * Weight tags, and Safetensor min-max ranges.
 */
export class FilterManager {
  /**
   * Applies all active criteria filters to an array of models.
   */
  public applyFilters(models: Model[], criteria: FilterCriteria): Model[] {
    return models.filter((model) => {
      // 1. Pipeline tags
      if (!model.matchesPipelineTag(criteria.pipelineTags)) {
        return false;
      }

      // 2. Family tags
      if (!model.matchesFamilyTag(criteria.familyTags)) {
        return false;
      }

      // 3. Architecture tags
      if (!model.matchesArchitectureTag(criteria.architectureTags)) {
        return false;
      }

      // 4. Weight tags
      if (!model.matchesWeightTag(criteria.weightTags)) {
        return false;
      }

      // 5. Safetensor range filter (min to max values)
      if (!model.matchesSafetensorRange(criteria.safetensorMin, criteria.safetensorMax)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Dynamically extracts all distinct tag values and bounds present in the dataset.
   */
  public extractAvailableOptions(models: Model[]): AvailableFilterOptions {
    const pipelineSet = new Set<string>();
    const familySet = new Set<string>();
    const archSet = new Set<string>();
    const weightSet = new Set<string>();
    let minSafetensor = Number.POSITIVE_INFINITY;
    let maxSafetensor = 0;

    for (const model of models) {
      if (model.hfTags.pipeline_tag) {
        pipelineSet.add(model.hfTags.pipeline_tag);
      }
      if (model.family) {
        familySet.add(model.family);
      }
      if (model.architectureCategory) {
        archSet.add(model.architectureCategory);
      }
      if (Array.isArray(model.hfTags.architecture)) {
        model.hfTags.architecture.forEach((a) => archSet.add(a));
      }
      if (model.weightFormat) {
        weightSet.add(model.weightFormat.replace(/\s*\(.*\)/, '').trim());
      }
      if (Array.isArray(model.hfTags.quantization)) {
        model.hfTags.quantization.forEach((q) => weightSet.add(q));
      }

      const count = model.safetensorFileCount;
      if (count < minSafetensor) minSafetensor = count;
      if (count > maxSafetensor) maxSafetensor = count;
    }

    return {
      pipelineTags: Array.from(pipelineSet).sort(),
      familyTags: Array.from(familySet).sort(),
      architectureTags: Array.from(archSet).sort(),
      weightTags: Array.from(weightSet).filter(Boolean).sort(),
      safetensorBoundMin: Number.isFinite(minSafetensor) ? minSafetensor : 0,
      safetensorBoundMax: maxSafetensor > 0 ? maxSafetensor : 500,
    };
  }
}
