import { goto } from "$app/navigation";
import { getCurrentUser, ResponseInternalError } from "../../../lib/http-interface";

export const load = async () => {
  try {
    return {
      user: await getCurrentUser(),
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
