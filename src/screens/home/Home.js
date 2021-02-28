import React from "react";
import Header from "../../common/Header";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Input,
  InputLabel
} from "@material-ui/core";
import "./Home.css";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";

export default class Home extends React.Component {
  constructor() {
    super();
    this.state = {
      profilePic: "",
      imagesData: [],
      filterImages: [],
      liked: false
    };
  }
  componentDidMount() {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      window.location = "/";
      return;
    }
    fetch(
      `https://api.instagram.com/v1/users/self/?access_token=${accessToken}`
    )
      .then(results => {
        return results.json();
      })
      .then(data => {
        if (data.data) {
          const { profile_picture } = data.data;
          this.setState({
            profilePic: profile_picture
          });
        }
      });
    fetch(
      `https://api.instagram.com/v1/users/self/media/recent?access_token=${accessToken}`
    )
      .then(results => {
        return results.json();
      })
      .then(data => {
        if (data.data) {
          const imagesData = data.data;
          this.setState({ imagesData: imagesData, filterImages: imagesData });
        }
      });
  }
  filterData = str => {
    const { imagesData } = this.state;
    if (imagesData) {
      const result = imagesData.filter(imageData =>
        imageData.caption.text.includes(str)
      );
      this.setState({ filterImages: result });
    }
  };
  dateConvertor = timeStamp => {
    let newDate = new Date(timeStamp);
    let year = newDate.getFullYear();
    let monthNo = newDate.getMonth() + 1;
    let date = newDate.getDate();
    let hour = newDate.getHours();
    let min = newDate.getMinutes();
    let sec = newDate.getSeconds();
    hour = hour % 12;
    hour = hour || 12;
    min = min < 10 ? "0" + min : min;
    date = date < 10 ? "0" + date : date;
    monthNo = monthNo < 10 ? "0" + monthNo : monthNo;
    let time = hour + ":" + min + ":" + sec;
    let dateObj = {
      time: time,
      calSlashDate: date + "/" + monthNo + "/" + year.toString()
    };
    return dateObj.calSlashDate + " " + dateObj.time;
  };
  liked = id => {
    const { filterImages } = this.state;
    const likedImage = filterImages.filter(img => img.id === id);
    const updateFilterImages = filterImages.map(img => {
      var returnValue = { ...img };
      if (img.id === likedImage.id) {
        returnValue["liked"] = true;
      }
      return returnValue;
    });
    console.log(updateFilterImages);
  };
  render() {
    const { profilePic, filterImages } = this.state;
    return (
      <React.Fragment>
        <Header
          homepageHeader={true}
          url={profilePic}
          onFilter={this.filterData}
        />
        <div className="card-wrapper">
          {filterImages && filterImages.length > 0
            ? filterImages.map(img => (
                <Card className="card" key={img.id}>
                  <CardHeader
                    avatar={
                      <Avatar aria-label="recipe">
                        <img
                          src={img.user.profile_picture}
                          alt="user"
                          className="profile-pic"
                        />
                      </Avatar>
                    }
                    title={img.user.username}
                    subheader={this.dateConvertor(Number(img.created_time))}
                  />
                  <CardContent>
                    <div className="content">
                      <img
                        src={img.images.standard_resolution.url}
                        alt="post-pic"
                        className="post-pic"
                      />
                      <hr />
                      <div className="caption">{img.caption.text}</div>
                      {img.tags
                        ? img.tags.map(tag => (
                            <span className="hashtags" key={tag}>
                              #{tag}&nbsp;
                            </span>
                          ))
                        : null}
                      {img.user_has_liked ? (
                        <p className="likes">
                          <FavoriteIcon
                            color="error"
                            className="like-icon"
                            onClick={() => this.liked(img.id)}
                          />
                          <span className="like-number">
                            &nbsp;{img.likes.count + 1} likes
                          </span>
                        </p>
                      ) : (
                        <p className="likes">
                          <FavoriteBorderIcon
                            className="like-icon"
                            onClick={() => this.liked(img.id)}
                          />
                          <span className="like-number">
                            &nbsp;{img.likes.count} likes
                          </span>
                        </p>
                      )}
                      <FormControl
                        fullWidth={true}
                        margin="normal"
                        className="comment-form"
                      >
                        <InputLabel htmlFor="comment">Add a comment</InputLabel>
                        <Input className="comment-input" />
                        <Button variant="contained" color="primary">
                          ADD
                        </Button>
                      </FormControl>
                    </div>
                  </CardContent>
                </Card>
              ))
            : null}
        </div>
      </React.Fragment>
    );
  }
}
