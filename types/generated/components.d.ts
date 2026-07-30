import type { Schema, Struct } from '@strapi/strapi';

export interface AirBuroojAirProject extends Struct.ComponentSchema {
  collectionName: 'components_air_burooj_air_projects';
  info: {
    displayName: 'burooj-air-project';
  };
  attributes: {
    description_ar: Schema.Attribute.Text;
    description_en: Schema.Attribute.Text;
    media: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title_ar: Schema.Attribute.String;
    title_en: Schema.Attribute.String;
  };
}

export interface AirProjectsGrid extends Struct.ComponentSchema {
  collectionName: 'components_air_projects_grids';
  info: {
    displayName: 'projects-grid';
  };
  attributes: {
    projects: Schema.Attribute.Component<'air.burooj-air-project', true>;
  };
}

export interface BuroojCards extends Struct.ComponentSchema {
  collectionName: 'components_burooj_cards';
  info: {
    displayName: 'cards';
  };
  attributes: {
    description_ar: Schema.Attribute.Text;
    description_en: Schema.Attribute.Text;
    image_position: Schema.Attribute.Enumeration<['above', 'below']>;
    images: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
  };
}

export interface BuroojProject extends Struct.ComponentSchema {
  collectionName: 'components_burooj_projects';
  info: {
    displayName: 'Burooj-Project';
  };
  attributes: {
    background: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    cards: Schema.Attribute.Component<'burooj.cards', true>;
    category_ar: Schema.Attribute.String;
    category_en: Schema.Attribute.String;
    client_ar: Schema.Attribute.String;
    client_en: Schema.Attribute.String;
    description_ar: Schema.Attribute.Text;
    description_en: Schema.Attribute.Text;
    location_ar: Schema.Attribute.String;
    location_en: Schema.Attribute.String;
    services: Schema.Attribute.Component<'burooj.services', true>;
    slug: Schema.Attribute.String;
    summary_ar: Schema.Attribute.Text;
    summary_en: Schema.Attribute.Text;
    thumbnail: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title_ar: Schema.Attribute.String;
    title_en: Schema.Attribute.String;
    year: Schema.Attribute.String;
  };
}

export interface BuroojServices extends Struct.ComponentSchema {
  collectionName: 'components_burooj_services';
  info: {
    displayName: 'services';
  };
  attributes: {
    name_ar: Schema.Attribute.String;
    name_en: Schema.Attribute.String;
  };
}

export interface EcClientsGrid extends Struct.ComponentSchema {
  collectionName: 'components_ec_clients_grids';
  info: {
    displayName: 'clients-grid';
  };
  attributes: {
    clients: Schema.Attribute.Component<'ec.efficiency-client', true>;
  };
}

export interface EcEcProject extends Struct.ComponentSchema {
  collectionName: 'components_ec_ec_projects';
  info: {
    displayName: 'ec-spaces';
  };
  attributes: {
    description_en: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    shape: Schema.Attribute.Enumeration<['square', 'tall']>;
    title_en: Schema.Attribute.String;
  };
}

export interface EcEfficiencyClient extends Struct.ComponentSchema {
  collectionName: 'components_ec_efficiency_clients';
  info: {
    displayName: 'efficiency-client';
  };
  attributes: {
    logo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    name: Schema.Attribute.String;
  };
}

export interface EcEfficiencyEvent extends Struct.ComponentSchema {
  collectionName: 'components_ec_efficiency_events';
  info: {
    displayName: 'efficiency-event';
  };
  attributes: {
    description_en: Schema.Attribute.Text;
    media: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title_en: Schema.Attribute.String;
  };
}

export interface EcEfficiencyReview extends Struct.ComponentSchema {
  collectionName: 'components_ec_efficiency_reviews';
  info: {
    displayName: 'efficiency-review';
  };
  attributes: {
    quote_en: Schema.Attribute.Text;
    reviewer_name: Schema.Attribute.String;
  };
}

export interface EcEventsGrid extends Struct.ComponentSchema {
  collectionName: 'components_ec_events_grids';
  info: {
    displayName: 'events-grid';
  };
  attributes: {
    events: Schema.Attribute.Component<'ec.efficiency-event', true>;
  };
}

export interface EcReviewsGrid extends Struct.ComponentSchema {
  collectionName: 'components_ec_reviews_grids';
  info: {
    displayName: 'reviews-grid';
  };
  attributes: {
    reviews: Schema.Attribute.Component<'ec.efficiency-review', true>;
  };
}

export interface EcSpacesGrid extends Struct.ComponentSchema {
  collectionName: 'components_ec_spaces_grids';
  info: {
    displayName: 'spaces-grid';
  };
  attributes: {
    spaces: Schema.Attribute.Component<'ec.ec-project', true>;
  };
}

export interface NaqshNaqshNews extends Struct.ComponentSchema {
  collectionName: 'components_naqsh_naqsh_news';
  info: {
    displayName: 'naqsh-news';
  };
  attributes: {
    category: Schema.Attribute.String;
    content_en: Schema.Attribute.Text;
    cover_image: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    date: Schema.Attribute.Date;
    excerpt_en: Schema.Attribute.Text;
    slug: Schema.Attribute.String;
    tags: Schema.Attribute.Component<'naqsh.tag', true>;
    title_en: Schema.Attribute.String;
  };
}

export interface NaqshNaqshProject extends Struct.ComponentSchema {
  collectionName: 'components_naqsh_naqsh_projects';
  info: {
    displayName: 'naqsh-Project';
  };
  attributes: {
    background: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    clinet_en: Schema.Attribute.String;
    Company: Schema.Attribute.String;
    Duration: Schema.Attribute.String;
    slug: Schema.Attribute.String;
    sub_sections: Schema.Attribute.Component<'naqsh.sub-section', true>;
    swiper: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    tags: Schema.Attribute.Component<'naqsh.tag', true>;
    thumbnail: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title_en: Schema.Attribute.String;
    Type: Schema.Attribute.String;
    year: Schema.Attribute.String;
  };
}

export interface NaqshSubSection extends Struct.ComponentSchema {
  collectionName: 'components_naqsh_sub_sections';
  info: {
    displayName: 'sub-section';
  };
  attributes: {
    description_en: Schema.Attribute.Text;
    image_position: Schema.Attribute.Enumeration<['above', 'below']>;
    images: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    title_en: Schema.Attribute.String;
  };
}

export interface NaqshTag extends Struct.ComponentSchema {
  collectionName: 'components_naqsh_tags';
  info: {
    displayName: 'tag';
  };
  attributes: {
    label: Schema.Attribute.String;
  };
}

export interface SectionsProject extends Struct.ComponentSchema {
  collectionName: 'components_sections_projects';
  info: {
    displayName: 'Project';
  };
  attributes: {
    background: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    cards: Schema.Attribute.Component<'ui.card', true>;
    category: Schema.Attribute.Component<'ui.category', false>;
    client_ar: Schema.Attribute.String;
    client_en: Schema.Attribute.String;
    date: Schema.Attribute.Date;
    description_ar: Schema.Attribute.Text;
    description_en: Schema.Attribute.Text;
    industry: Schema.Attribute.Component<'ui.industry', false>;
    page_layout: Schema.Attribute.Enumeration<['one', 'two', 'three', 'four']>;
    slug: Schema.Attribute.String;
    swiber: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    thumbnail: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title_ar: Schema.Attribute.String;
    title_en: Schema.Attribute.String;
  };
}

export interface UiCard extends Struct.ComponentSchema {
  collectionName: 'components_ui_cards';
  info: {
    displayName: 'Card';
  };
  attributes: {
    description_ar: Schema.Attribute.Text;
    description_en: Schema.Attribute.Text;
    images: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    layout: Schema.Attribute.Enumeration<['default']> &
      Schema.Attribute.DefaultTo<'default'>;
    subtitle_ar: Schema.Attribute.String;
    subtitle_en: Schema.Attribute.Text;
    title_ar: Schema.Attribute.String;
    title_en: Schema.Attribute.String;
  };
}

export interface UiCategory extends Struct.ComponentSchema {
  collectionName: 'components_ui_category_s';
  info: {
    displayName: 'Category ';
  };
  attributes: {
    name_ar: Schema.Attribute.String;
    name_en: Schema.Attribute.String;
  };
}

export interface UiIndustry extends Struct.ComponentSchema {
  collectionName: 'components_ui_industry_s';
  info: {
    displayName: 'Industry ';
  };
  attributes: {
    name_ar: Schema.Attribute.String;
    name_en: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'air.burooj-air-project': AirBuroojAirProject;
      'air.projects-grid': AirProjectsGrid;
      'burooj.cards': BuroojCards;
      'burooj.project': BuroojProject;
      'burooj.services': BuroojServices;
      'ec.clients-grid': EcClientsGrid;
      'ec.ec-project': EcEcProject;
      'ec.efficiency-client': EcEfficiencyClient;
      'ec.efficiency-event': EcEfficiencyEvent;
      'ec.efficiency-review': EcEfficiencyReview;
      'ec.events-grid': EcEventsGrid;
      'ec.reviews-grid': EcReviewsGrid;
      'ec.spaces-grid': EcSpacesGrid;
      'naqsh.naqsh-news': NaqshNaqshNews;
      'naqsh.naqsh-project': NaqshNaqshProject;
      'naqsh.sub-section': NaqshSubSection;
      'naqsh.tag': NaqshTag;
      'sections.project': SectionsProject;
      'ui.card': UiCard;
      'ui.category': UiCategory;
      'ui.industry': UiIndustry;
    }
  }
}
