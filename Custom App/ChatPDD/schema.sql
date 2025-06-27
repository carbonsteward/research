-- Carbon Standards Table
CREATE TABLE CarbonStandard (
    standard_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    abbreviation TEXT,
    introducing_entity TEXT,
    organization_type TEXT,
    geographic_scope TEXT,
    focus_sector TEXT,
    description TEXT,
    website_url TEXT,
    icroa_approved BOOLEAN,
    corsia_approved BOOLEAN,
    corresponding_adjustment_label TEXT,
    total_methodologies INTEGER,
    last_updated TIMESTAMP
);

-- Methodology Table
CREATE TABLE Methodology (
    methodology_id TEXT PRIMARY KEY,
    standard_id TEXT REFERENCES CarbonStandard(standard_id),
    name TEXT NOT NULL,
    type TEXT,
    category TEXT,
    link TEXT,
    itmo_acceptance BOOLEAN,
    description TEXT,
    last_updated TIMESTAMP
);

-- PDD Requirements Table
CREATE TABLE PDDRequirement (
    requirement_id TEXT PRIMARY KEY,
    standard_id TEXT REFERENCES CarbonStandard(standard_id),
    methodology_id TEXT REFERENCES Methodology(methodology_id),
    section_name TEXT,
    description TEXT,
    required BOOLEAN,
    guidance_notes TEXT,
    template_url TEXT,
    last_updated TIMESTAMP
);

-- Certification Process Table
CREATE TABLE CertificationProcess (
    process_id TEXT PRIMARY KEY,
    standard_id TEXT REFERENCES CarbonStandard(standard_id),
    step_number INTEGER,
    step_name TEXT,
    description TEXT,
    estimated_duration TEXT,
    estimated_cost TEXT,
    responsible_party TEXT,
    documentation_required TEXT,
    last_updated TIMESTAMP
);
