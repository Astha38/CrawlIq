"""Initial schema for sites, crawls, pages, issues, and scores

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-23 10:37:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create tables
    op.create_table(
        'sites',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('domain', sa.String(length=255), nullable=False),
        sa.Column('display_name', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_sites_domain'), 'sites', ['domain'], unique=False)
    op.create_index(op.f('ix_sites_user_id'), 'sites', ['user_id'], unique=False)

    op.create_table(
        'crawls',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('site_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sites.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', name='crawl_status'), nullable=False),
        sa.Column('pages_crawled', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('max_pages', sa.Integer(), nullable=False, server_default='100'),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'pages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('crawl_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('crawls.id', ondelete='CASCADE'), nullable=False),
        sa.Column('url', sa.String(length=2048), nullable=False),
        sa.Column('status_code', sa.Integer(), nullable=True),
        sa.Column('crawler_used', sa.Enum('SCRAPY', 'PLAYWRIGHT', name='crawler_type'), nullable=True),
        sa.Column('raw_data', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('performance_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('crawled_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_pages_url'), 'pages', ['url'], unique=False)

    op.create_table(
        'issues',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('page_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('pages.id', ondelete='CASCADE'), nullable=False),
        sa.Column('issue_type', sa.String(length=100), nullable=False),
        sa.Column('severity', sa.Enum('CRITICAL', 'WARNING', 'INFO', name='issue_severity'), nullable=False),
        sa.Column('message', sa.String(length=500), nullable=False),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_issues_issue_type'), 'issues', ['issue_type'], unique=False)

    op.create_table(
        'scores',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('crawl_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('crawls.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('overall_score', sa.Float(), nullable=False),
        sa.Column('breakdown', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('calculated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('scores')
    op.drop_index(op.f('ix_issues_issue_type'), table_name='issues')
    op.drop_table('issues')
    op.drop_index(op.f('ix_pages_url'), table_name='pages')
    op.drop_table('pages')
    op.drop_table('crawls')
    op.drop_index(op.f('ix_sites_user_id'), table_name='sites')
    op.drop_index(op.f('ix_sites_domain'), table_name='sites')
    op.drop_table('sites')
    op.execute('DROP TYPE crawl_status')
    op.execute('DROP TYPE crawler_type')
    op.execute('DROP TYPE issue_severity')
