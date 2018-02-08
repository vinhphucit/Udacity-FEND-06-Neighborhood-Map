import React from 'react';

export default class LocationRow extends React.Component {
    render() {
        const { location, selectFavourite } = this.props;
        return (
            <div className="favourite control" onClick={this.props.selectFavourite.bind(this, this.props.location)}>{location.name}</div>
        );
    }
}
