// @refresh reload
import { Suspense } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Link,
  Meta,
  Routes,
  Scripts,
  Title,
  useNavigate
} from "solid-start";
import { httpClient } from "./lib/http-interface";
import "./carbon-web-components";

import "./root.scss";

export default function Root() {
  const navigate = useNavigate();

  httpClient.systemErrorObservable.subscribe((error) => {
    switch (error.httpStatus) {
      case 401:
        navigate("/login", { replace: true });
        break;
      default:
    }
  });

  return (
    <Html lang="en">
      <Head>
        <Title>HOME Dashboard</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <Link rel="stylesheet" href="https://1.www.s81c.com/common/carbon/plex/sans.css" />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
