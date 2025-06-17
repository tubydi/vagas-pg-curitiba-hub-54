
-- Adicionar campos para candidatura externa
ALTER TABLE jobs 
ADD COLUMN has_external_application boolean DEFAULT false,
ADD COLUMN application_method text,
ADD COLUMN contact_info text;

-- Comentário sobre os novos campos:
-- has_external_application: indica se a vaga permite candidatura direta com a empresa
-- application_method: método de candidatura (WhatsApp, Email, Telefone, etc.)
-- contact_info: informação de contato (número, email, etc.)
