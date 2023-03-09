import { z } from "zod";
import { ref, computed } from "vue";

export const tagSchema = z.object({
  name: z.string().optional(),
  locked: z.boolean().optional(),
});

export const tagsSchema = z.array(tagSchema);

export type Tag = z.infer<typeof tagSchema>;

export const useTags = () => {
  const tags = ref<Tag[]>([]);

  const addTag = (tagName: string) => {
    if (!tags.value.map((t) => t.name).includes(tagName)) {
      tags.value.push({ name: tagName });
    }
  };
  const deleteTag = (tagName: string) => {
    tags.value = tags.value.filter((t) => t.name !== tagName);
  };
  const lockTag = (tagName: string, lock: boolean) => {
    tags.value = tags.value.map((t) =>
      t.name !== tagName ? t : { name: tagName, lock }
    );
  };
  const validTags = computed(() =>
    tags.value.filter(
      (t): t is { name: string; locked?: boolean } => t.name !== undefined
    )
  );

  return {
    tags,
    addTag,
    deleteTag,
    lockTag,
    validTags,
  };
};
