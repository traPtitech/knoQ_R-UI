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
  description: z.string(),
  open: z.boolean(),
  members: z.array(z.string()),
  admins: z.array(z.string()),
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

export type InstantPlaceTime = z.infer<typeof instantPlaceTimeSchemma>;
export type StockPlaceTime = z.infer<typeof stockPlaceTimeSchema>;
export type PlaceTime = InstantPlaceTime | StockPlaceTime;

export type InstantGroup = z.infer<typeof instantGroupSchemma>;
export type StockGroup = z.infer<typeof stockGroupSchema>;
export type Group = InstantGroup | StockGroup;

type EventForm = z.infer<typeof eventFormSchema>;

const defaultValues: EventForm = {
  name: "",
  description: "",
  sharedRoom: false,
  placeTimes: [],
  group: {
    groupId: "",
  },
  open: true,
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

  const addPlaceTime = (placeTime: PlaceTime) => {
    event.value.placeTimes.push(placeTime);
  };
  const deletePlaceTime = (placeTime: PlaceTime) => {
    event.value.placeTimes = event.value.placeTimes.filter(
      (item) => item !== placeTime
    );
  };
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
