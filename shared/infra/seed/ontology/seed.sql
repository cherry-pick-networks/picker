-- Ontology seed: one concept scheme (DDC) and top-level concepts. Run after db:schema.

INSERT INTO concept_scheme (scheme_id, name)
VALUES ('ddc', 'Dewey Decimal Classification')
ON CONFLICT (scheme_id) DO NOTHING;

INSERT INTO concept (scheme_id, code, pref_label)
VALUES
  ('ddc', '000', 'Computer science, information & general works'),
  ('ddc', '100', 'Philosophy & psychology'),
  ('ddc', '200', 'Religion'),
  ('ddc', '300', 'Social sciences'),
  ('ddc', '400', 'Language'),
  ('ddc', '500', 'Science'),
  ('ddc', '600', 'Technology'),
  ('ddc', '700', 'Arts & recreation'),
  ('ddc', '800', 'Literature'),
  ('ddc', '900', 'History & geography')
ON CONFLICT (scheme_id, code) DO NOTHING;
