var EventBox = React.createClass({
  loadEventsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  getInitialState: function() {
    return {data: []};
  },

  componentDidMount: function() {
    this.loadEventsFromServer();
    setInterval(this.loadEventsFromServer, this.props.pollInterval);
  },

  handleEventSubmit: function(event) {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: event,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  handleEventUpdate: function(id, event) {
      var url = this.props.url.concat("/",id);
      $.ajax({
          url: url,
          dataType: 'json',
          type: 'POST',
          data: event,
          success: function(data) {
            this.setState({data: data});
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(this.props.url, status, err.toString());
          }.bind(this)
        });
  },

  render: function() {
    return (
      <div className="eventBox">
        <h1>Events</h1>
        <EventList data={this.state.data} onEventUpdate={this.handleEventUpdate}/>
        <EventForm onEventSubmit={this.handleEventSubmit}/>
      </div>
    );
  }
});

var EventList = React.createClass({
  handleUpdate: function(id, data) {
      this.props.onEventUpdate(id, data)
  },
  render: function() {
    var eventNodes = this.props.data.map(function(event) {
      var handle_update = this.handleUpdate.bind(this, event.id);
      return (
        <Event title={event.title} date={event.date} key={event.id} onEventUpdate={handle_update}>
          {event.description}
        </Event>
      );
    }.bind(this));
    return (
      <div className="eventList">
        {eventNodes}
      </div>
    );
  }
});

var EventForm = React.createClass({
  getInitialState: function() {
    return {title: '', description: '', date: ''};
  },
  handleTitleChange: function(e) {
    this.setState({title: e.target.value});
  },
  handleDescriptionChange: function(e) {
    this.setState({description: e.target.value});
  },
  handleDateChange: function(e) {
    this.setState({date: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var title = this.state.title.trim();
    var description = this.state.description.trim();
    var date = this.state.date.trim();
    if (!description || !title) {
      return;
    }
    this.props.onEventSubmit({title: title, description: description, date: date});
    this.setState({title: '', description: '', date:''});
  },
  render: function() {
    return (
      <form className="eventForm" onSubmit={this.handleSubmit}>
        Add Event: 
        <input
          type="text"
          placeholder="Event title"
          value={this.state.title}
          onChange={this.handleTitleChange}
        />
        <input
          type="text"
          placeholder="Event Description"
          value={this.state.description}
          onChange={this.handleDescriptionChange}
        />
        <input
          type="text"
          placeholder="Event Date"
          value={this.state.date}
          onChange={this.handleDateChange}
        />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

var Event = React.createClass({

  getInitialState: function() {
    return { isEditing: false };
  },
  
  toggleEditing: function(e) {
    e.preventDefault();
    this.setState({isEditing: !this.state.isEditing});
  },

  handleUpdate: function(e) {
    e.preventDefault();
    var description = ReactDOM.findDOMNode(this.refs.description).value.trim();
    if (!description ) {
      return;
    }
    this.props.onEventUpdate({description: description});
    this.setState({isEditing: !this.state.isEditing});
  },

  render: function() {
    return (
      <div>
        <div className="event">
          <h2 className="eventTitle">
            Title: {this.props.title}
          </h2>
          <h4 className="eventDate">
            Date: {this.props.date}
          </h4>
          Description: {this.props.children}
        </div>
        <div className="eventActions">
          <div className={ this.state.isEditing ?  '' : 'hidden'}>
            <form className="eventForm" onSubmit={this.handleUpdate}>
              <input type="text" defaultValue={ this.props.description } ref="description" placeholder="edit description"  />
              <input type="submit" value="Confirm changes" />  
            </form>
          </div>
        </div>
      </div>
    );
  }
});

ReactDOM.render(
  <EventBox url="/api/events" pollInterval={2000}/>,
  document.getElementById('content')
);