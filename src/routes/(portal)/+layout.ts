import { goto } from "$app/navigation";
import { getConfigurationUpdates, ResponseInternalError } from "../../lib/http-interface";

export const load = async () => {
  try {
    return {
      configurationUpdates: await getConfigurationUpdates(),
    };
  } catch (e) {
    if (!(e instanceof ResponseInternalError)) throw e;

    switch (e.httpStatus) {
      case 401:
        await goto("/login");
        break;
      default:
        throw e;
    }
  }
};
