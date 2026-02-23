-- Idempotent ontology seed: DDC top-level scheme and classes; exactMatch sample.
-- Run after 05_ontology.sql DDL. Run: deno task seed:ontology

INSERT INTO concept_scheme (id, pref_label)
VALUES ('ddc', 'Dewey Decimal Classification (top-level)')
ON CONFLICT (id) DO NOTHING;

INSERT INTO concept (id, scheme_id, pref_label, notation, source, path)
VALUES
  ('ddc-000', 'ddc', 'Computer science, information and general works', '000', 'ddc', '000'::ltree),
  ('ddc-100', 'ddc', 'Philosophy and psychology', '100', 'ddc', '100'::ltree),
  ('ddc-200', 'ddc', 'Religion', '200', 'ddc', '200'::ltree),
  ('ddc-300', 'ddc', 'Social sciences', '300', 'ddc', '300'::ltree),
  ('ddc-400', 'ddc', 'Language', '400', 'ddc', '400'::ltree),
  ('ddc-500', 'ddc', 'Natural sciences and mathematics', '500', 'ddc', '500'::ltree),
  ('ddc-600', 'ddc', 'Technology', '600', 'ddc', '600'::ltree),
  ('ddc-700', 'ddc', 'Arts and recreation', '700', 'ddc', '700'::ltree),
  ('ddc-800', 'ddc', 'Literature', '800', 'ddc', '800'::ltree),
  ('ddc-900', 'ddc', 'History and geography', '900', 'ddc', '900'::ltree)
ON CONFLICT (id) DO NOTHING;

-- Optional: scheme for external URI concepts (exactMatch targets).
INSERT INTO concept_scheme (id, pref_label)
VALUES ('dewey-uri', 'Dewey class URIs (dewey.info)')
ON CONFLICT (id) DO NOTHING;

INSERT INTO concept (id, scheme_id, pref_label, notation, source)
VALUES
  ('dewey-uri-000', 'dewey-uri', 'http://dewey.info/class/000/', NULL, 'dewey.info'),
  ('dewey-uri-500', 'dewey-uri', 'http://dewey.info/class/500/', NULL, 'dewey.info')
ON CONFLICT (id) DO NOTHING;

INSERT INTO concept_relation (source_id, target_id, relation_type)
VALUES
  ('ddc-000', 'dewey-uri-000', 'exactMatch'),
  ('ddc-500', 'dewey-uri-500', 'exactMatch')
ON CONFLICT (source_id, target_id, relation_type) DO NOTHING;
