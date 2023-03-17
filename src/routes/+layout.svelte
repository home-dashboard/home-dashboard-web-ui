<script lang="ts">
  import "../styles.scss";

  import { httpClient } from "../lib/http-interface";
  import { goto } from "$app/navigation";

  httpClient.systemErrorObservable.subscribe((error) => {
    switch (error.httpStatus) {
      case 401:
        goto("/login", { replaceState: true });
        break;
      default:
    }
  });
</script>

<slot />
