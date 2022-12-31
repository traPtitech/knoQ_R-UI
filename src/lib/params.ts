import { RouteParamValue } from "vue-router";

export const getFirstParam = (param: RouteParamValue | RouteParamValue[]) => {
  if (Array.isArray(param)) {
    return param[0];
  } else {
    return param ?? undefined;
  }
};
