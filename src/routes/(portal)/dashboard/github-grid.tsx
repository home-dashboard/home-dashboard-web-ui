import { notUAN } from "@siaikin/utils";
import { GitHub } from "../../../lib/third-party";
import { createMemo, createResource } from "solid-js";
import { Icon } from "@iconify-icon/solid";

export default function GitHubGrid() {
  // const [breakpoint, { smallerThan, largerThan }] = BreakpointsContext.useContext();

  const [userInfo] = createResource(async () => await GitHub.getUserInfo());

  const gitHubHost = createMemo(() => (notUAN(userInfo()) ? userInfo()?.url : ""));
  // const gitHubUserAvatar = createMemo(() => (notUAN(userInfo()) ? userInfo().avatarUrl : ""));
  const gitHubUserName = createMemo(() => (notUAN(userInfo()) ? userInfo()?.name : ""));
  const gitHubUserFollowerCount = createMemo(() =>
    notUAN(userInfo()) ? userInfo()?.followerCount : 0
  );
  const gitHubUserFollowingCount = createMemo(() =>
    notUAN(userInfo()) ? userInfo()?.followingCount : 0
  );
  // const gitHubUserWatcherCount = createMemo(() =>
  //   notUAN(userInfo()) ? userInfo().repositoryInfo.watcherCount : 0
  // );
  // const gitHubUserForkCount = createMemo(() =>
  //   notUAN(userInfo()) ? userInfo().repositoryInfo.forkCount : 0
  // );
  // const gitHubUserStargazerCount = createMemo(() =>
  //   notUAN(userInfo()) ? userInfo().repositoryInfo.stargazerCount : 0
  // );
  const gitHubUserContributionWeeks = createMemo(
    () =>
      userInfo()
        ?.contributionCalendar.weeks.map(({ contributionDays }) =>
          contributionDays.map((day) => ({
            count: day.contributionCount,
            date: day.date,
            level:
              GitHub.ContributionLevel[
                day.contributionLevel as keyof typeof GitHub.ContributionLevel
              ]
          }))
        )
        .flat() ?? []
  );
  const legendText = createMemo(
    () => `${gitHubUserFollowerCount()} followers · ${gitHubUserFollowingCount()} following`
  );

  return (
    <div class="github-grid cds--css-grid cds--css-grid--condensed">
      <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-8 cds--lg:col-span-16">
        <form class="control-form">
          <cds-link href={gitHubHost()} target="_blank">
            <Icon width={32} height={32} icon="carbon:logo-github" title="Power by GitHub" />
          </cds-link>
          <header class="flex-auto w-0">
            <h4 class="truncate" title={gitHubUserName()}>
              {gitHubUserName()}
            </h4>
            <p class="truncate" title={legendText()}>
              <Icon icon="octicon:people-16" inline /> {legendText()}
            </p>
          </header>
        </form>
      </div>

      <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-8 cds--lg:col-span-16">
        <cds-tile class="github-tile">
          <GitHub.GitHubContributionsChart days={gitHubUserContributionWeeks()} />
        </cds-tile>
      </div>
    </div>
  );
}
