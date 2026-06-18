package agent

import (
	"errors"
	"testing"
)

func TestRecordingEmitter_Token(t *testing.T) {
	r := &RecordingEmitter{}
	r.Token("a")
	r.Token("b")

	if len(r.Events) != 2 {
		t.Fatalf("expected 2 events, got %d", len(r.Events))
	}
	for i, want := range []struct{ typeStr, delta string }{
		{"token", "a"},
		{"token", "b"},
	} {
		got := r.Events[i]
		if got.Type != want.typeStr {
			t.Errorf("event %d Type = %q, want %q", i, got.Type, want.typeStr)
		}
		if got.Delta != want.delta {
			t.Errorf("event %d Delta = %q, want %q", i, got.Delta, want.delta)
		}
		if got.ToolName != "" || got.Err != nil || got.Result != nil || got.Message != "" {
			t.Errorf("event %d has unexpected non-zero fields: %+v", i, got)
		}
	}
}

func TestRecordingEmitter_ToolStartToolEnd(t *testing.T) {
	r := &RecordingEmitter{}
	r.ToolStart("list_characters")
	r.ToolEnd("list_characters", nil)

	if len(r.Events) != 2 {
		t.Fatalf("expected 2 events, got %d", len(r.Events))
	}

	if r.Events[0].Type != "tool_start" || r.Events[0].ToolName != "list_characters" {
		t.Errorf("event 0 = %+v, want tool_start/list_characters", r.Events[0])
	}
	if r.Events[1].Type != "tool_end" || r.Events[1].ToolName != "list_characters" {
		t.Errorf("event 1 = %+v, want tool_end/list_characters", r.Events[1])
	}
	if r.Events[1].Err != nil {
		t.Errorf("event 1 Err = %v, want nil (success)", r.Events[1].Err)
	}
}

func TestRecordingEmitter_ToolEndWithError(t *testing.T) {
	r := &RecordingEmitter{}
	boom := errors.New("oops")
	r.ToolEnd("foo", boom)

	if len(r.Events) != 1 {
		t.Fatalf("expected 1 event, got %d", len(r.Events))
	}
	ev := r.Events[0]
	if ev.Type != "tool_end" {
		t.Errorf("Type = %q, want tool_end", ev.Type)
	}
	if ev.ToolName != "foo" {
		t.Errorf("ToolName = %q, want foo", ev.ToolName)
	}
	if ev.Err != boom {
		t.Errorf("Err = %v, want %v", ev.Err, boom)
	}
}

func TestRecordingEmitter_DoneAndError(t *testing.T) {
	r := &RecordingEmitter{}
	type fakeResult struct{ Content string }
	want := &fakeResult{Content: "hello"}
	r.Done(want)
	r.Error("bad")

	if len(r.Events) != 2 {
		t.Fatalf("expected 2 events, got %d", len(r.Events))
	}

	doneEv := r.Events[0]
	if doneEv.Type != "done" {
		t.Errorf("event 0 Type = %q, want done", doneEv.Type)
	}
	if doneEv.Result != want {
		t.Errorf("event 0 Result = %+v, want %+v", doneEv.Result, want)
	}

	errEv := r.Events[1]
	if errEv.Type != "error" {
		t.Errorf("event 1 Type = %q, want error", errEv.Type)
	}
	if errEv.Message != "bad" {
		t.Errorf("event 1 Message = %q, want bad", errEv.Message)
	}
}
