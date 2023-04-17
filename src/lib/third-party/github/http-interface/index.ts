import { httpClient } from "../../../http-interface";

export async function resetNotification(): Promise<void> {
  return httpClient.get({
    url: "github/notification/reset",
  });
}

export async function getUserInfo(): Promise<UserInfo> {
  return httpClient.get({
    url: "github/user",
  });
}

export interface UserInfo {
  name: string;
  followerCount: number;
  followingCount: number;
  email: string;
  avatarUrl: string;
  url: string;
  contributionCalendar: {
    totalContributions: number;
    weeks: Array<{
      contributionDays: Array<ContributionDay>;
    }>;
  };
  repositoryInfo: {
    totalDiskUsage: number;
    stargazerCount: number;
    watcherCount: number;
    forkCount: number;
  };
}

export interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
  contributionLevel: string;
}
