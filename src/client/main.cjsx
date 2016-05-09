React = require "react"
ReactDOM = require "react-dom"
request = require "superagent"

URL_REGISTER_IDS = "/lib/register-ids"
URL_REGISTERED_IDS = "/lib/registered-ids"

RegisterVideoID = React.createClass

  getInitialState: ->
    videoIDs: ""

  handleVideoidsChange: (e) ->
    @setState
      videoIDs: e.target.value

  onClickRegister: (e) ->
    request
      .post URL_REGISTER_IDS
      .send [1,2,3,4,5]
      .end (err, res) =>

  render: ->
    <div className="container">
      <h2>Register new Video IDs</h2>
      <form>
        <div className="form-group">
          <label htmlFor="video-ids">Video IDs</label>
          <input
            id="video-ids" className="form-control" type="text"
            value={@state.videoIDs} onChange={@handleVideoidsChange}
            placeholder="Comma-separated video IDs"/>
        </div>
        <button
          className="btn btn-default" type="button"
          onClick={@onClickRegister}>Register</button>
      </form>
    </div>


RegisteredVideoIDs = React.createClass

  getInitialState: ->
    ids: []

  componentDidMount: ->
    request
      .get URL_REGISTERED_IDS
      .end (err, res) =>
        console.log res
        @setState
          ids: res.body

  render: ->
    ids = @state.ids
    <div className="container">
      <h2>Registered Video IDs</h2>
      <ul>
        {ids.map (v) ->
          <li key={v.key}>{v.value}</li>
        }
      </ul>
    </div>


ReactDOM.render(
  <div>
    <RegisterVideoID/>
    <RegisteredVideoIDs/>
  </div>,
  document.getElementById "react"
)
