<script lang="ts">
  import {
    Column,
    Form,
    Grid,
    ImageLoader,
    Link,
    Row,
    Truncate,
    truncate,
    breakpointObserver,
    Tile,
  } from "carbon-components-svelte";
  import Icon from "@iconify/svelte";
  import { notUAN } from "@siaikin/utils";
  import { getUserInfo, ContributionsChart, ContributionLevel } from "../../lib/third-party/github";
  import type { UserInfo } from "../../lib/third-party/github";
  import { mounted } from "../../lib/stores";
  import GitHubLogo from "$lib/assets/images/github-logo.svg";

  const size = breakpointObserver();
  const isMounted = mounted();

  let userInfo: UserInfo | undefined;
  isMounted.subscribe(async (mounted) => {
    if (!mounted) return;

    userInfo = await getUserInfo();
  });

  $: githubHost = notUAN(userInfo) ? userInfo.url : "";
  $: githubUserAvatar = notUAN(userInfo) ? userInfo.avatarUrl : "";
  $: githubUserName = notUAN(userInfo) ? userInfo.name : "";
  $: githubUserFollowerCount = notUAN(userInfo) ? userInfo.followerCount : 0;
  $: githubUserFollowingCount = notUAN(userInfo) ? userInfo.followingCount : 0;
  $: githubUserWatcherCount = notUAN(userInfo) ? userInfo.repositoryInfo.watcherCount : 0;
  $: githubUserForkCount = notUAN(userInfo) ? userInfo.repositoryInfo.forkCount : 0;
  $: githubUserStargazerCount = notUAN(userInfo) ? userInfo.repositoryInfo.stargazerCount : 0;
  $: githubUserContributionWeeks = notUAN(userInfo)
    ? userInfo.contributionCalendar.weeks
        .map(({ contributionDays }) =>
          contributionDays.map((day) => ({
            count: day.contributionCount,
            date: day.date,
            level: ContributionLevel[day.contributionLevel],
          }))
        )
        .flat()
    : [];
</script>

<Grid condensed class="github-grid">
  <Row>
    <Column sm="{4}" md="{8}" lg="{16}">
      <Form class="control-form">
        <Link href="{githubHost}" target="_blank" style="margin-left: 0.5rem">
          <ImageLoader fadeIn alt="Power by GitHub" style="width: 2rem" src="{GitHubLogo}" />
        </Link>
        <header style="flex: 1 1 auto; width: 0">
          <h4 use:truncate title="{githubUserName}">{githubUserName}</h4>
          <Truncate>
            <Icon icon="octicon:people-16" inline />
            {githubUserFollowerCount}
            followers ·
            {githubUserFollowingCount}
            following
          </Truncate>
        </header>
      </Form>
    </Column>
  </Row>

  <Row>
    <Column sm="{4}" md="{8}" lg="{16}">
      <Tile class="github-tile">
        <!--        <Icon icon="octicon:star-16" inline />-->
        <!--        {githubUserStargazerCount}-->
        <!--        <Icon icon="octicon:eye-16" inline />-->
        <!--        {githubUserWatcherCount}-->
        <!--        <Icon icon="octicon:repo-forked-16" inline />-->
        <!--        {githubUserForkCount}-->

        <ContributionsChart days="{githubUserContributionWeeks}" />
      </Tile>
    </Column>
  </Row>
</Grid>
