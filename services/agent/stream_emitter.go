package agent

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// StreamEmitter is the interface the streaming loop calls to push progress
// events to the frontend. It abstracts over a real Wails event emitter
// (production) and an in-memory recorder (tests).
//
// Lifecycle expectation (driven by the streaming loop in Task 5):
//   - Token(delta)         — may be called zero or more times per round
//   - ToolStart(name)      — called immediately before router.Dispatch
//   - ToolEnd(name, err)   — called after Dispatch returns (err nil = ok)
//   - Done(result)         — called exactly once on success
//   - Error(msg)           — called exactly once on failure (terminates stream)
//
// Done and Error are mutually exclusive: exactly one is emitted per session.
type StreamEmitter interface {
	Token(delta string)
	ToolStart(name string)
	ToolEnd(name string, err error)
	Done(result any)
	Error(msg string)
}

// ---------------------------------------------------------------------------
// RecordingEmitter — test double. Appends every call into Events for assertion.
// ---------------------------------------------------------------------------

// RecordedEvent captures a single StreamEmitter call.
type RecordedEvent struct {
	Type     string // "token" | "tool_start" | "tool_end" | "done" | "error"
	ToolName string
	Delta    string
	Err      error
	Message  string
	Result   any
}

// RecordingEmitter satisfies StreamEmitter by appending each call to Events.
// Tests inspect Events in order to assert the stream protocol.
type RecordingEmitter struct {
	Events []RecordedEvent
}

func (r *RecordingEmitter) Token(delta string) {
	r.Events = append(r.Events, RecordedEvent{
		Type:  "token",
		Delta: delta,
	})
}

func (r *RecordingEmitter) ToolStart(name string) {
	r.Events = append(r.Events, RecordedEvent{
		Type:     "tool_start",
		ToolName: name,
	})
}

func (r *RecordingEmitter) ToolEnd(name string, err error) {
	r.Events = append(r.Events, RecordedEvent{
		Type:     "tool_end",
		ToolName: name,
		Err:      err,
	})
}

func (r *RecordingEmitter) Done(result any) {
	r.Events = append(r.Events, RecordedEvent{
		Type:   "done",
		Result: result,
	})
}

func (r *RecordingEmitter) Error(msg string) {
	r.Events = append(r.Events, RecordedEvent{
		Type:    "error",
		Message: msg,
	})
}

// ---------------------------------------------------------------------------
// WailsEmitter — production impl. Forwards each call to runtime.EventsEmit
// using the agreed event contract:
//   - agent:token       {sessionID, delta}
//   - agent:tool_start  {sessionID, toolName}
//   - agent:tool_end    {sessionID, toolName, ok, error?}
//   - agent:done        {sessionID, agentKind, result}
//   - agent:error       {sessionID, message}
//
// agentKind is fixed for the lifetime of one emitter (a creative agent never
// becomes a review agent), so it is supplied at construction time rather than
// per-call. The interface's Done(result any) intentionally omits it.
// ---------------------------------------------------------------------------

// WailsEmitter wraps a Wails app context and emits frontend events.
type WailsEmitter struct {
	ctx       context.Context
	sessionID string
	agentKind string // "creative" | "review"
}

// NewWailsEmitter constructs a production emitter bound to a Wails context.
// The ctx is the app context passed by Wails to bound Go methods; it is what
// runtime.EventsEmit expects.
func NewWailsEmitter(ctx context.Context, sessionID, agentKind string) *WailsEmitter {
	return &WailsEmitter{ctx: ctx, sessionID: sessionID, agentKind: agentKind}
}

// AgentKind returns the agent kind this emitter was constructed with.
// Exposed so callers (and future diagnostics) can introspect the emitter.
func (e *WailsEmitter) AgentKind() string { return e.agentKind }

func (e *WailsEmitter) Token(delta string) {
	runtime.EventsEmit(e.ctx, "agent:token", map[string]any{
		"sessionID": e.sessionID,
		"delta":     delta,
	})
}

func (e *WailsEmitter) ToolStart(name string) {
	runtime.EventsEmit(e.ctx, "agent:tool_start", map[string]any{
		"sessionID": e.sessionID,
		"toolName":  name,
	})
}

func (e *WailsEmitter) ToolEnd(name string, err error) {
	payload := map[string]any{
		"sessionID": e.sessionID,
		"toolName":  name,
		"ok":        err == nil,
	}
	if err != nil {
		payload["error"] = err.Error()
	}
	runtime.EventsEmit(e.ctx, "agent:tool_end", payload)
}

func (e *WailsEmitter) Done(result any) {
	runtime.EventsEmit(e.ctx, "agent:done", map[string]any{
		"sessionID": e.sessionID,
		"agentKind": e.agentKind,
		"result":    result,
	})
}

func (e *WailsEmitter) Error(msg string) {
	runtime.EventsEmit(e.ctx, "agent:error", map[string]any{
		"sessionID": e.sessionID,
		"message":   msg,
	})
}
