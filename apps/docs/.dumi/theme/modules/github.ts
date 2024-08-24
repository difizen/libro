import { prop, singleton } from '@difizen/mana-app';
import { Octokit } from 'octokit';

@singleton()
export class Github {
  @prop()
  stars: number;

  protected octokit = new Octokit({});

  getRepoStars = async (owner: string, repo: string) => {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });
      const stars = data.stargazers_count;
      return stars;
    } catch (error) {
      return undefined;
    }
  };
}
