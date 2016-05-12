React = require "react"
ReactDOM = require "react-dom"
{
  Button, Grid, FormGroup, FormControl, ControlLabel, ListGroup, ListGroupItem
} = require "react-bootstrap"
request = require "superagent"

URL_REGISTER_IDS = "/lib/register-ids"
URL_REGISTERED_IDS = "/lib/registered-ids"


VideoIDManager = React.createClass

  getInitialState: ->
    registeredIDs: []

  componentDidMount: ->
    @loadRegisteredIDs()
    do pull = =>
      @loadRegisteredIDs()
      setTimeout pull, 5*60*1000

  handleRegister: (ids) ->
    request
      .post URL_REGISTER_IDS
      .send ids
      .end (err, res) =>
        @loadRegisteredIDs()

  loadRegisteredIDs: ->
    request
      .get URL_REGISTERED_IDS
      .end (err, res) =>
        console.log err
        @setState
          registeredIDs: res.body

  render: ->
    <div>
      <RegisterVideoID onRegister={@handleRegister}/>
      <RegisteredVideoIDs ids={@state.registeredIDs}/>
    </div>


# Rendering a form for a list of registering IDs.
#
# Props:
#   onRegister: Function to be called when users click register button.
#               It receives a list of IDs to be registered.
RegisterVideoID = React.createClass

  propTypes:
    onRegister: React.PropTypes.func

  getInitialState: ->
    videoIDs: ""

  handleVideoIDsChange: (e) ->
    @setState
      videoIDs: e.target.value

  handleRegister: ->
    if @state.videoIDs isnt ""
      if @props.onRegister?
        @props.onRegister @state.videoIDs.split(",").map (v) ->
          v.replace(/^\s+|\s+$/g, "")
      @setState
        videoIDs: ""

  render: ->
    <Grid>
      <h2>Register new Video IDs</h2>
      <form>
        <FormGroup controlId="video-ids">
          <ControlLabel>Video IDs</ControlLabel>
          <FormControl
            value={@state.videoIDs} onChange={@handleVideoIDsChange}
            placeholder="Comma-separated video IDs"/>
        </FormGroup>
        <FormControl name="dummy" style={{"display": "none"}}/>
        <Button onClick={@handleRegister}>Register</Button>
      </form>
    </Grid>


# Rendering a list of registered IDs.
#
# Props:
#   ids: List of IDs.
RegisteredVideoIDs = (props) ->
  <Grid>
    <h2>Registered Video IDs</h2>
    <ListGroup componentClass="ul">
      {props.ids.map (v) ->
        <ListGroupItem key={v}>{v}</ListGroupItem>
      }
    </ListGroup>
  </Grid>


ReactDOM.render <VideoIDManager />, document.getElementById("react")
