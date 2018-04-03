// @flow
"use strict";
import * as React from 'react';
import ReactDOM from 'react-dom';
import {Link, HashRouter, Route} from 'react-router-dom';
import createHashHistory from 'history/createHashHistory';
const history = createHashHistory();
import {Article, articleService} from './services';
import {Alert, NavigationBar, Card, Table, Form} from './widgets';
import Signal from 'signals';
import moment from 'moment';

class Home extends React.Component<{}> {
  render() {
    return <Card title="Example App">Demonstration of React with Flow and server communication</Card>;
  }
}

class ArticleDetails extends React.Component<{match: {params: {id: number}}}, {article: ?Article}> {
  state = {article: null};

  render() {
    if (!this.state.article) return null;
    return (
      <Card title={'Article: ' + this.state.article.title}>
        <div>
          <div>
            <strong>{this.state.article.abstract}</strong>
          </div>
          <div>{this.state.article.text}</div>
          <div> Score: {this.state.article.score}</div>
            <Card title="comments">
                {this.state.article.Comments.map(comment =>
                    <Card key={comment.text}>
                        {comment.text}
                        <br />
                        <div className="text-secondary">
                            {moment(comment.createdAt).fromNow()}
                        </div>
                    </Card>
                )}
            </Card>
            <input type="text" ref={e => this.commenttext = e} placeholder="comment text"/>
            <button onClick={this.comment}>Comment</button>
          <button onClick={this.upvote}>upvote</button>
          <button onClick={this.downvote}>downvote</button>
        </div>
      </Card>
    );
  }

  upvote = () => {
    articleService.upvote(this.state.article.id).then(() => {
      this.update();
    });
  };

    comment = () => {
        if(this.commenttext.value)
            articleService.comment(this.state.article.id, this.commenttext.value).then(() => {
                this.update();
            });
        this.update();
    };

  downvote = () => {
    articleService.downvote(this.state.article.id).then(() => {
      this.update();
    });
  };


    // Helper function to update component
  update() {
      if(this.props.match.params.id == '0')
          return null;
    articleService
      .getArticle(this.props.match.params.id)
      .then(article => {
        this.setState({article: article});
      })
      .catch((error: Error) => {
        Alert.danger('Error getting article ' + this.props.match.params.id + ': ' + error.message);
      });
  }

  componentDidMount(){
    this.update();
  }

  // Called when the this.props-object change while the component is mounted
  // For instance, when navigating from path /articles/1 to /articles/2
  componentWillReceiveProps() {
    setTimeout(() => {
      this.update();
    }, 0); // Enqueue this.update() after props has changed
  }
}

class NewArticle extends React.Component<{category: string}> {
  form;
  title;
  abstract;
  text;

  onAdd: Signal<> = new Signal();

  render() {
    return (
      <Card title="New Article">
        <Form
          ref={e => (this.form = e)}
          submitLabel="Add Article"
          groups={[
            {label: 'Title', input: <input ref={e => (this.title = e)} type="text" required />},
            {label: 'Abstract', input: <textarea ref={e => (this.abstract = e)} rows="2" required />},
            {label: 'Text', input: <textarea ref={e => (this.text = e)} rows="3" required />},
            {checkInputs: [{label: 'I have read, understand and accept the terms and ...', input: <input type="checkbox" required />}]}
          ]}
        />
      </Card>
    );
  }

  componentDidMount() {
    if (this.form) {
      this.form.onSubmit.add(() => {
        if (!this.title || !this.abstract || !this.text) return;
        articleService
          .addArticle(this.title.value, this.abstract.value, this.text.value, this.props.category)
          .then(id => {
            if (this.form) this.form.reset();
            this.onAdd.dispatch();
            history.push('/articles/' + id + '/' + this.props.category + '/false');
          })
          .catch((error: Error) => {
            Alert.danger('Error adding article: ' + error.message);
          });
      });
    }
  }
}

class Articles extends React.Component<{match: {params: {id: number, category: string, popular: string }}}> {
  table;
  newArticle;

  render() {

      let title_addendum = "";
      if(this.props.match.params.category && this.props.match.params.category != 'null')
          title_addendum = " (" + this.props.match.params.category + ")";

    return (
      <div>
        <Card title={"Articles" + title_addendum}>
          <Table ref={e => (this.table = e)} header={['Title', 'Abstract', 'Score', 'Created', 'Comments']} />
        </Card>
          {this.props.match.params.id != 0 &&
            <Route exact path="/articles/:id/:category/:popular" component={ArticleDetails} />
          }


          { (this.props.match.params.category != null && this.props.match.params.category != 'null' &&
          this.props.match.params.popular != null && this.props.match.params.popular == 'false') &&
            <NewArticle ref={e => (this.newArticle = e)} category={this.props.match.params.category} />
          }
      </div>
    );
  }

  // Helper function to update component
  update() {
      console.log(this.props);
      let articlePromise;

      if(this.props.match.params.popular == 'false'){
          if(this.props.match.params.category && this.props.match.params.category != 'null'){
              articlePromise = articleService.getArticlesByCategory(this.props.match.params.category);
          }
          else{
              articlePromise = articleService.getArticles();
          }
      }
      else{
          if(this.props.match.params.category && this.props.match.params.category != 'null'){
              articlePromise = articleService.getArticlesByCategoryPopular(this.props.match.params.category);
          }
          else{
              articlePromise = articleService.getArticlesPopular();
          }
      }

    articlePromise.then(articles => {
        if (this.table) this.table.setRows(articles.map(article => ({id: article.id, cells: [article.title, article.abstract, article.score, moment(article.createdAt).fromNow(), article.Comments.length]})));
      })
      .catch((error: Error) => {
        Alert.danger('Error getting articles: ' + error.message);
      });
  }

  componentDidMount() {
    if (this.table) {
      this.table.onRowClick.add(rowId => {
        history.push('/articles/' + rowId + '/' + this.props.match.params.category + '/' + this.props.match.params.popular);
      });
    }
    if (this.newArticle) {
      this.newArticle.onAdd.add(() => {
        this.update();
      });
    }
    this.update();
  }

    // Called when the this.props-object change while the component is mounted
    // For instance, when navigating from path /articles/1 to /articles/2
    componentWillReceiveProps() {
        setTimeout(() => {
            this.update();
        }, 0); // Enqueue this.update() after props has changed
    }

}

let root = document.getElementById('root');
if (root) {
    articleService.getCategories().then(categories => {
        ReactDOM.render(
            <HashRouter>
                <div>
                    <Alert />
                    All articles:
                    <Link className="btn-primary btn-sm" to="/articles/0/null/false" text="Articles">Articles</Link>
                    {categories.map(category => <Link className="btn-primary btn-sm" key={category} to={'/articles/0/' + category + '/false'}>{category}</Link>)}

                    <br />
                    Popular articles:
                    <Link className="btn-primary btn-sm" to="/articles/0/null/true" text="Articles">Articles</Link>
                    {categories.map(category => <Link className="btn-primary btn-sm" key={category} to={'/articles/0/' + category + '/true'}>{category}</Link>)}

                    <Route exact path="/" component={Home} />
                    <Route path="/articles/:id/:category/:popular" component={Articles} />

                </div>
            </HashRouter>,
            root
        );
    });
    // let categories = ['science', 'politics'];


}
