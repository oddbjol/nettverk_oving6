// @flow

export class Article {
  id: number;
  title: string;
  abstract: string;
  text: string;
  score: number;
  Comments: string[];
  createdAt: Date
}

class ArticleService {
  getArticles(): Promise<Article[]> {
    return fetch('/articles').then(response => {
      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    });
  }

  getArticlesPopular(): Promise<Article[]> {
      return fetch('/articles').then(response => {
          if (!response.ok) throw new Error(response.statusText);
          return response.json();
      }).then(articles => {
        return new Promise((resolve, reject) => {
          articles.sort((a,b) => {
              // days since 1970
              const daysA = Math.floor(new Date(a.createdAt).getTime()/8.64e7);
              const daysB = Math.floor(new Date(b.createdAt).getTime()/8.64e7);

              if(daysA == daysB)
                  return daysA - daysB;
              else
                return a.score-b.score
          });
            resolve(articles.slice(0, 5));
        });
      });
  }

    getArticlesByCategory(category: string): Promise<Article[]> {
        return fetch('/articlesByCategory/' + category).then(response => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        });
    }

  getArticlesByCategoryPopular(category: string): Promise<Article[]>{
      return fetch('/articlesByCategory/' + category).then(response => {
          if (!response.ok) throw new Error(response.statusText);
          return response.json();
      }).then(articles => {
          return new Promise((resolve, reject) => {
              articles.sort((a,b) => {
                  // days since 1970
                  const daysA = Math.floor(new Date(a.createdAt).getTime()/8.64e7);
                  const daysB= Math.floor(new Date(b.createdAt).getTime()/8.64e7);

                  if(daysA == daysB)
                      return daysA - daysB;
                  else
                      return a.score-b.score
              });

              resolve(articles.slice(0, 5));
          });
      });
  }


  getArticle(id: number): Promise<Article> {
    return fetch('/articles/' + id).then(response => {
      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    });
  }

  addArticle(title: string, abstract: string, text: string, category: string): Promise<number> {
    let body = JSON.stringify({title: title, abstract: abstract, text: text, category: category});
    return fetch('/articles', {method: 'POST', headers: new Headers({'Content-Type': 'application/json'}), body: body}).then(response => {
      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    });
  }

  upvote(id: number): Promise{
    return fetch('/articles/' + id + '/upvote', {method: 'POST'});
  }

  downvote(id: number): Promise{
      return fetch('/articles/' + id + '/downvote', {method: 'POST'});
  }

  comment(id: number, comment: string): Promise{
      return fetch('/articles/' + id + '/comment/' + comment, {method: 'POST'});
  }

  getCategories(): Promise<string[]>{
      return fetch('/categories/').then(categories => {
          return categories.json();
      }).then(categories => {
          return categories.map(category => category.name);
      });
  }
}
export let articleService = new ArticleService();
