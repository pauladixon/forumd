import React, { Component } from 'react';
import axios from 'axios';
import './ViewPost.css';

import Utility from '../../../Utility';
import SubmitComment from './comments/submitComment';
import DeleteComment from './comments/deleteComments';

class ViewPost extends Component {

  constructor(props) {
    super(props);
    this.state = {
      post: null,
      comments: null,
      sort: 'New',
      bookmarked: false,
      isAuthenticated: null,
      user: null,
      url: null
    }
    this.getPost = this.getPost.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.handleSort = this.handleSort.bind(this);
    this.handleBookmark = this.handleBookmark.bind(this);
  }

  componentWillMount() {
    this.getPost();
    this.isAuthenticated();
  }

  componentDidMount() {
    //this.isAuthenticated();
  }

  isAuthenticated() {
    axios.get('/api/user').then((response) => {
      //console.log(response);
      if (response.data.user) {
        return this.setState({
          isAuthenticated: true,
          user: response.data.user
        });
      } else {
        return this.setState({ isAuthenticated: false });
      }
    });
  }

  getPost() {
    let postTitle = this.props.match.params.title;
    let shortId = this.props.match.params.shortId;
    axios.get(`/api/post/${postTitle}/${shortId}`)
    .then(response => {
      return this.setState({ 
        post: response.data,
        comments: response.data._comments.reverse(),
        url: this.props.location.pathname
      });
    })
    .then(result => {
      if (this.state.post && this.state.user) {
        console.log(this.state.user.bookmarks.includes(this.props.location.pathname))
        if (this.state.user.bookmarks.includes(this.props.location.pathname)) {
          this.setState({ bookmarked: true });
        }
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }
  // Add/remove bookmark
  handleBookmark(e) {
    e.preventDefault();
    if (this.state.user) {
      this.setState({
        bookmarked: !this.state.bookmarked
      });
      if (this.state.bookmarked === true) {
        axios.post('/api/removeBookmark', 
        { 
          link: this.props.location.pathname
        })
        .then(response => {
          //console.log(response.data);
          this.isAuthenticated();
        });
        window.location.reload();
      }
      if (this.state.bookmarked === false) {
        axios.post('/api/addBookmark', 
        { 
          link: this.props.location.pathname
        })
        .then(response => {
          //console.log(response.data);
          this.isAuthenticated();
        });
        window.location.reload();
      }
    }
  }
  // Sort by date
  handleSort(e) {
      e.preventDefault();
      if (this.state.sort === 'New') {
          this.setState({ 
              sort: 'Old',
              comments: this.state.comments.reverse()
          });
      } else if (this.state.sort === 'Old') {
          this.setState({ 
              sort: 'New',
              comments: this.state.comments.reverse()
          });
      }
  }

  render() {
    //console.log(this.state.bookmarked)
    if(this.state.post) {
      return (
        <div className="Post">
          <div className="card">
            <div className="card-body">
                <h4 className="card-title">{this.state.post.title}</h4>
                {this.state.post._author
                ? <p className="card-text">{this.state.post._author.username}</p>
                : <p className="card-text">deleted</p>
                }
                <p className="card-text">{Utility.parseDate(this.state.post.createdAt).elapsed}</p>
                {this.state.post.link
                ? <a className='d-inline-flex p-2' href={this.state.post.link}>{this.state.post.link}</a>
                : <p className="card-text d-inline-flex p-2">{this.state.post.text}</p>
                }
                <hr/>
                {this.state.bookmarked
                ? <a onClick={this.handleBookmark} className='' href=''>
                  <i className="fa fa-bookmark fa-2x" aria-hidden="true"></i>
                  </a>
                : <a onClick={this.handleBookmark} className='' href=''>
                  <i className="fa fa-bookmark-o fa-2x" aria-hidden="true"></i>
                  </a>
                }
            </div>
          </div>
          <hr />
          <SubmitComment title={this.props.match.params.title}
              isAuthenticated={this.state.isAuthenticated}
              url={this.props.location.pathname} 
              postId={this.props.match.params.shortId} />
          <button onClick={this.handleSort} type="button" className="btn btn-elegant btn-sm">
              <i className="fa fa-sort" aria-hidden="true"></i>
              &nbsp; {this.state.sort}
          </button>
          {this.state.comments && this.state.comments.map(comment => (
          <div key={comment.shortId} className="card card-body commentCard">
              <p className="card-text">{comment.text}</p>
              {comment._author 
              ? <p className="card-text">by {comment._author.username}</p>
              : <p className="card-text">by deleted</p>
              }
              <p className="card-text">
                  {Utility.parseDate(comment.createdAt).elapsed}
              </p>
              {comment._author && this.state.isAuthenticated && this.state.user.username === comment._author.username && (
              <div className='flex-row'>
                <DeleteComment deleted={this.getPost} shortId={comment.shortId} />
              </div>
              )}
          </div>
          ))}
        </div>
      );
    }
    return null;
  }
}

export default ViewPost;
