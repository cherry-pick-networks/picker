-- Idempotent ontology seed: one DDC top-level scheme and sample top-level classes.
-- Run after 05_ontology.sql DDL. Run: deno task seed:ontology

INSERT INTO concept_scheme (id, pref_label)
VALUES ('ddc', 'Dewey Decimal Classification (top-level)')
ON CONFLICT (id) DO NOTHING;

INSERT INTO concept (id, scheme_id, pref_label, notation, source)
VALUES
  ('ddc-000', 'ddc', 'Computer science, information and general works', '000', 'ddc'),
  ('ddc-100', 'ddc', 'Philosophy and psychology', '100', 'ddc'),
  ('ddc-200', 'ddc', 'Religion', '200', 'ddc'),
  ('ddc-300', 'ddc', 'Social sciences', '300', 'ddc'),
  ('ddc-400', 'ddc', 'Language', '400', 'ddc'),
  ('ddc-500', 'ddc', 'Natural sciences and mathematics', '500', 'ddc'),
  ('ddc-600', 'ddc', 'Technology', '600', 'ddc'),
  ('ddc-700', 'ddc', 'Arts and recreation', '700', 'ddc'),
  ('ddc-800', 'ddc', 'Literature', '800', 'ddc'),
  ('ddc-900', 'ddc', 'History and geography', '900', 'ddc')
ON CONFLICT (id) DO NOTHING;
