import { z } from "zod";
import { computed, ref, watch } from "vue";
import { tagsSchema, useTags } from "./useTags";

const instantPlaceTimeSchemma = z.object({
  place: z.string(),
  timeStart: z.date(),
  timeEnd: z.date(),
});

const stockPlaceTimeSchema = z.object({
  roomId: z.string(),
  timeStart: z.date(),
  timeEnd: z.date(),
});

const instantGroupSchemma = z.object({
  name: z.string(),
});

const stockGroupSchema = z.object({
  groupId: z.string(),
});

const eventFormSchema = z.object({
  name: z.string(),
  description: z.string(),
  sharedRoom: z.boolean(),
  placeTimes: z.array(z.union([instantPlaceTimeSchemma, stockPlaceTimeSchema])),
  group: z.union([instantGroupSchemma, stockGroupSchema]),
  open: z.boolean(),
  admins: z.array(z.string()),
  tags: tagsSchema,
});
type EventForm = z.infer<typeof eventFormSchema>;

const defaultValues: EventForm = {
  name: "",
  description: "",
  sharedRoom: false,
  placeTimes: [],
  group: {
    groupId: "",
  },
  open: false,
  admins: [],
  tags: [],
};

export const useEventForm = () => {
  const { tags, addTag, deleteTag, lockTag, validTags } = useTags();

  const event = ref<EventForm>(defaultValues);

  watch(
    tags,
    (newTags, _) => {
      event.value.tags = newTags;
    },
    { immediate: true }
  );

  const addPlaceTime = () => {};
  const deletePlaceTime = () => {};
  const editPlaceTime = () => {};

  return {
    event,
    addTag,
    deleteTag,
    lockTag,
    validTags,
    addPlaceTime,
    deletePlaceTime,
    editPlaceTime,
  };
};
