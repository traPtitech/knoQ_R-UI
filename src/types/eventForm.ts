import { z } from "zod";

export const tagSchema = z.object({
  name: z.string().nonempty(),
  locked: z.boolean().optional(),
});

export const tagsSchema = z.array(tagSchema);

export type Tag = z.infer<typeof tagSchema>;

const instantPlaceTimeSchemma = z
  .object({
    type: z.literal("instant"),
    place: z.string().nonempty(),
    timeStart: z.date(),
    timeEnd: z.date(),
  })
  .refine(
    (schema) =>
      schema.timeStart && schema.timeEnd && schema.timeStart < schema.timeEnd,
    {
      message: "終了は開始より後にしてください。",
    }
  );

const stockPlaceTimeSchema = z
  .object({
    type: z.literal("stock"),
    roomId: z.string().uuid(),
    timeStart: z.date(),
    timeEnd: z.date(),
  })
  .refine(
    (schema) =>
      schema.timeStart && schema.timeEnd && schema.timeStart < schema.timeEnd,
    {
      message: "終了は開始より後にしてください。",
    }
  );

const instantGroupSchemma = z.object({
  name: z.string().nonempty(),
  description: z.string(),
  open: z.boolean(),
  members: z.array(z.string().uuid()),
  admins: z.array(z.string().uuid()),
});

const stockGroupSchema = z.object({
  groupId: z.string().uuid(),
});

export const eventFormSchema = z.object({
  name: z.string().nonempty(),
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

export type EventForm = z.infer<typeof eventFormSchema>;

export const defaultValues: EventForm = {
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
