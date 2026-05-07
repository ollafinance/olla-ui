-- Constrain withdrawal_requests.event_type to the currently emitted set.
-- The removed `instant_redemption` value is no longer produced by the
-- indexer; any historical rows are dropped before the CHECK is added.

DELETE FROM withdrawal_requests
 WHERE event_type NOT IN ('redeem_request', 'withdrawal_claimed');

ALTER TABLE withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_event_type_check
    CHECK (event_type IN ('redeem_request', 'withdrawal_claimed'));
