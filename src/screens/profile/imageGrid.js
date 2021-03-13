import React from "react";
import { GridList, GridListTile } from "@material-ui/core";
export default class ImageGrid extends React.Component {
  render() {
    const { posts } = this.props;
    console.log(posts)
    return (
      <React.Fragment>
        <GridList cellHeight={160} cols={3}>
          {posts.map(post => (
            <GridListTile key={post.id} cols={1}>
              <img src={post.imageUrl} alt="img" />
            </GridListTile>
          ))}
        </GridList>
      </React.Fragment>
    );
  }
}
