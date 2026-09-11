"""create_core_postgis_tables

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-09-10 22:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry

# revision identifiers, used by Alembic.
revision: str = '0001_initial_schema'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Ensure PostGIS spatial extension is enabled
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    # 2. Table: districts
    op.create_table(
        'districts',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=False),
        sa.Column('habitations_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('critical_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('exposed_pop', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('dominant_hazard', sa.String(length=200), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # 3. Table: candidate_relocation_sites
    op.create_table(
        'candidate_relocation_sites',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('district_id', sa.String(length=50), nullable=True),
        sa.Column('district_name', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=False),
        sa.Column('distance_from_red_zone_km', sa.Float(), nullable=True, server_default='0'),
        sa.Column('usable_area_sqm', sa.Float(), nullable=False, server_default='0'),
        sa.Column('usable_area_acres', sa.Float(), nullable=True, server_default='0'),
        sa.Column('estimated_capacity', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('slope_degree', sa.Float(), nullable=True, server_default='0'),
        sa.Column('suitability_score', sa.Float(), nullable=False, server_default='0'),
        sa.Column('overall_recommendation', sa.String(length=100), nullable=True, server_default='Suitable'),
        sa.Column('factor_hazard_safety', sa.Integer(), nullable=True, server_default='80'),
        sa.Column('factor_accessibility', sa.Integer(), nullable=True, server_default='80'),
        sa.Column('factor_land_suitability', sa.Integer(), nullable=True, server_default='80'),
        sa.Column('factor_water_availability', sa.Integer(), nullable=True, server_default='80'),
        sa.Column('factor_healthcare_access', sa.Integer(), nullable=True, server_default='80'),
        sa.Column('factor_education_access', sa.Integer(), nullable=True, server_default='80'),
        sa.Column('factor_carrying_capacity', sa.Integer(), nullable=True, server_default='80'),
        sa.Column('capacity_status', sa.String(length=50), nullable=True, server_default='Optimal'),
        sa.Column('carrying_capacity_factor', sa.Float(), nullable=True, server_default='1.0'),
        sa.Column('water_availability_status', sa.String(length=255), nullable=True),
        sa.Column('distance_to_road_m', sa.Float(), nullable=True, server_default='0'),
        sa.Column('road_accessibility', sa.String(length=255), nullable=True),
        sa.Column('distance_to_hospital_km', sa.Float(), nullable=True, server_default='0'),
        sa.Column('healthcare_status', sa.String(length=255), nullable=True),
        sa.Column('distance_to_school_km', sa.Float(), nullable=True, server_default='0'),
        sa.Column('schooling_status', sa.String(length=255), nullable=True),
        sa.Column('power_grid_access', sa.String(length=255), nullable=True),
        sa.Column('allocated_population', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('maximum_absorption', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('remaining_capacity', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('utilization_percent', sa.Float(), nullable=True, server_default='0'),
        sa.Column('potable_water_daily_needed_kl', sa.Float(), nullable=True, server_default='0'),
        sa.Column('potable_water_daily_supplied_kl', sa.Float(), nullable=True, server_default='0'),
        sa.Column('hospital_beds_required', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('hospital_beds_available', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('geom', Geometry(geometry_type='POINT', srid=4326, from_text='ST_GeomFromEWKT', name='geometry', spatial_index=True), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['district_id'], ['districts.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_sites_district', 'candidate_relocation_sites', ['district_name'], unique=False)
    op.create_index('idx_sites_suitability', 'candidate_relocation_sites', ['suitability_score'], unique=False)

    # 4. Table: habitations
    op.create_table(
        'habitations',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('district_id', sa.String(length=50), nullable=True),
        sa.Column('district_name', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=False),
        sa.Column('population', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('households', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('kutcha_housing_percent', sa.Float(), nullable=True, server_default='0'),
        sa.Column('risk_score', sa.Float(), nullable=False, server_default='0'),
        sa.Column('risk_tier', sa.String(length=50), nullable=False, server_default='Moderate'),
        sa.Column('vulnerability_index', sa.Float(), nullable=True, server_default='0'),
        sa.Column('dominant_hazards', sa.String(length=255), nullable=True),
        sa.Column('slope_degree', sa.Float(), nullable=True, server_default='0'),
        sa.Column('rainfall_3d_mm', sa.Float(), nullable=True, server_default='0'),
        sa.Column('rainfall_anomaly_percent', sa.Float(), nullable=True, server_default='0'),
        sa.Column('road_isolation_distance_km', sa.Float(), nullable=True, server_default='0'),
        sa.Column('hospital_distance_km', sa.Float(), nullable=True, server_default='0'),
        sa.Column('historical_disasters_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('recent_casualties', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('priority', sa.Integer(), nullable=False, server_default='4'),
        sa.Column('priority_label', sa.String(length=100), nullable=True, server_default='In-Situ Monitoring'),
        sa.Column('recommended_site_id', sa.String(length=50), nullable=True),
        sa.Column('geom', Geometry(geometry_type='POINT', srid=4326, from_text='ST_GeomFromEWKT', name='geometry', spatial_index=True), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['district_id'], ['districts.id'], ),
        sa.ForeignKeyConstraint(['recommended_site_id'], ['candidate_relocation_sites.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_habitations_district', 'habitations', ['district_name'], unique=False)
    op.create_index('idx_habitations_risk_tier', 'habitations', ['risk_tier'], unique=False)
    op.create_index('idx_habitations_priority', 'habitations', ['priority'], unique=False)

    # 5. Table: habitation_ai_factors
    op.create_table(
        'habitation_ai_factors',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('habitation_id', sa.String(length=50), nullable=False),
        sa.Column('factor', sa.String(length=150), nullable=False),
        sa.Column('impact', sa.String(length=50), nullable=False),
        sa.Column('direction', sa.String(length=20), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('weight', sa.Float(), nullable=True, server_default='0'),
        sa.ForeignKeyConstraint(['habitation_id'], ['habitations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 6. Table: red_zones
    op.create_table(
        'red_zones',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('hazard_type', sa.String(length=100), nullable=False),
        sa.Column('risk_level', sa.String(length=50), nullable=False, server_default='Critical'),
        sa.Column('area_sq_km', sa.Float(), nullable=True, server_default='0'),
        sa.Column('enclosed_habitations_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('exposed_population', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('buffer_margin_m', sa.Float(), nullable=True, server_default='300'),
        sa.Column('primary_trigger', sa.String(length=255), nullable=True),
        sa.Column('geom', Geometry(geometry_type='POLYGON', srid=4326, from_text='ST_GeomFromEWKT', name='geometry', spatial_index=True), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # 7. Table: system_alerts
    op.create_table(
        'system_alerts',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('severity', sa.String(length=30), nullable=False, server_default='warning'),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('timestamp_text', sa.String(length=100), nullable=True),
        sa.Column('read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('district', sa.String(length=100), nullable=False, server_default='Statewide'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_alerts_read', 'system_alerts', ['read'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_alerts_read', table_name='system_alerts')
    op.drop_table('system_alerts')
    op.drop_table('red_zones')
    op.drop_table('habitation_ai_factors')
    op.drop_index('idx_habitations_priority', table_name='habitations')
    op.drop_index('idx_habitations_risk_tier', table_name='habitations')
    op.drop_index('idx_habitations_district', table_name='habitations')
    op.drop_table('habitations')
    op.drop_index('idx_sites_suitability', table_name='candidate_relocation_sites')
    op.drop_index('idx_sites_district', table_name='candidate_relocation_sites')
    op.drop_table('candidate_relocation_sites')
    op.drop_table('districts')
