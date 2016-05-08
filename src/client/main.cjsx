React = require "react"
ReactDOM = require "react-dom"


RegisterVideoID = React.createClass

  getInitialState: ->
    videoIDs: ""

  handleVideoidsChange: (e) ->
    @setState
      videoIDs: e.target.value

  onClickRegister: (e) ->


  render: ->
    <div className="container">
      <h2>Register a new Video ID</h2>
      <form>
        <div className="form-group">
          <label htmlFor="video-ids">Video IDs</label>
          <input
            id="video-ids" className="form-control" type="text"
            value={@state.videoIDs} onChange={@handleVideoidsChange}
            placeholder="Comma-separated video IDs"/>
        </div>
        <button
          className="btn btn-default"
          onClidk={@onClickRegister}>Register</button>
      </form>
    </div>


RegisteredVideoIDs = React.createClass

  getInitialState: ->
    ids: []

  componentDidMount: ->
    @setState
      ids: ["a", "b", "c"]

  render: ->
    ids = @state.ids
    <div className="container">
      <h2>Registered Video IDs</h2>
      <ul>
        {ids.map (v) ->
          <li key={v}>{v}</li>
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
