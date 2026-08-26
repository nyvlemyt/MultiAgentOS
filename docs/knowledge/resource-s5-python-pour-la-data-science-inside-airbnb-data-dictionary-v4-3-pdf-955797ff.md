---
id: >-
  resource-s5-python-pour-la-data-science-inside-airbnb-data-dictionary-v4-3-pdf-955797ff
slug: >-
  resource-s5-python-pour-la-data-science-inside-airbnb-data-dictionary-v4-3-pdf-955797ff
source_key: 'sha256:955797ff44a7154619af7be06291777c24f9c110a5c9dc613013e8ab4f3fc33a'
part_of: S5 - Python pour la Data Science
order: 1
manifest: null
derived_from: 'sha256:955797ff44a7154619af7be06291777c24f9c110a5c9dc613013e8ab4f3fc33a'
sources: []
lifecycle: distilled
superseded_by: null
trust: untrusted
ocr_confidence: null
retrieval_context: null
quality_score: null
kind: resource
register: learnings
scope: global
doc_type: reference
actionability: resource
lane: resources
schema_version: '1'
tags:
  - airbnb
  - dataset
  - data-dictionary
  - csv
  - inside-airbnb
  - data-science
  - python
domain: Data Science
---
# S5 - Python pour la Data Science — Inside Airbnb Data Dictionary v4.3.pdf

## Summary

Data dictionary for the Inside Airbnb `listings.csv` detailed file (v4.3, August 2022). Describes all fields available in the dataset used for Airbnb market analysis — identifiers, host attributes, location, property characteristics, pricing, availability, and review metrics.

## Fields/API

**name**: id
**type**: integer
**calculated**: false
**description**: Airbnb's unique identifier for the listing
**name**: listing_url
**type**: text
**calculated**: true
**description**: URL to the listing page
**name**: scrape_id
**type**: bigint
**calculated**: true
**description**: Inside Airbnb scrape session identifier
**name**: last_scraped
**type**: datetime
**calculated**: true
**description**: UTC datetime this listing was scraped
**name**: source
**type**: text
**calculated**: false
**description**: Either 'neighbourhood search' (found via city search) or 'previous scrape' (seen in a scrape within the last 65 days and confirmed still active)
**name**: name
**type**: text
**calculated**: false
**description**: Name of the listing
**name**: description
**type**: text
**calculated**: false
**description**: Detailed description of the listing
**name**: neighborhood_overview
**type**: text
**calculated**: false
**description**: Host's description of the neighbourhood
**name**: picture_url
**type**: text
**calculated**: false
**description**: URL to the Airbnb-hosted regular-sized image for the listing
**name**: host_id
**type**: integer
**calculated**: false
**description**: Airbnb's unique identifier for the host/user
**name**: host_url
**type**: text
**calculated**: true
**description**: Airbnb profile page for the host
**name**: host_name
**type**: text
**calculated**: false
**description**: Name of the host (usually first name only)
**name**: host_since
**type**: date
**calculated**: false
**description**: Date the host account was created; for guests who also host, may be their guest registration date
**name**: host_location
**type**: text
**calculated**: false
**description**: Host's self-reported location
**name**: host_about
**type**: text
**calculated**: false
**description**: Host's self-description
**name**: host_response_time
**type**: text
**calculated**: false
**description**: Typical response time category for the host
**name**: host_response_rate
**type**: text
**calculated**: false
**description**: Rate at which the host responds to messages
**name**: host_acceptance_rate
**type**: text
**calculated**: false
**description**: Rate at which the host accepts booking requests
**name**: host_is_superhost
**type**: boolean
**calculated**: false
**description**: t=true, f=false
**name**: host_thumbnail_url
**type**: text
**calculated**: false
**description**: URL to the host's thumbnail photo
**name**: host_picture_url
**type**: text
**calculated**: false
**description**: URL to the host's profile picture
**name**: host_neighbourhood
**type**: text
**calculated**: false
**description**: Neighbourhood self-reported by the host
**name**: host_listings_count
**type**: text
**calculated**: false
**description**: Number of listings the host has per Airbnb's internal calculation
**name**: host_total_listings_count
**type**: text
**calculated**: false
**description**: Total number of listings the host has per Airbnb's internal calculation
**name**: host_verifications
**type**: text
**calculated**: false
**description**: List of verification methods completed by the host
**name**: host_has_profile_pic
**type**: boolean
**calculated**: false
**description**: t=true, f=false
**name**: host_identity_verified
**type**: boolean
**calculated**: false
**description**: t=true, f=false
**name**: neighbourhood
**type**: text
**calculated**: false
**description**: Neighbourhood as reported by the host or scrape
**name**: neighbourhood_cleansed
**type**: text
**calculated**: true
**description**: Neighbourhood geocoded from lat/lng against public digital shapefiles
**name**: neighbourhood_group_cleansed
**type**: text
**calculated**: true
**description**: Neighbourhood group geocoded from lat/lng against public digital shapefiles
**name**: latitude
**type**: numeric
**calculated**: false
**description**: WGS84 latitude
**name**: longitude
**type**: numeric
**calculated**: false
**description**: WGS84 longitude
**name**: property_type
**type**: text
**calculated**: false
**description**: Self-selected property type; hotels and B&Bs are labelled as such by hosts
**name**: room_type
**type**: text
**calculated**: false
**description**: One of: Entire home/apt | Private room | Shared room | Hotel
**name**: accommodates
**type**: integer
**calculated**: false
**description**: Maximum guest capacity
**name**: bathrooms
**type**: numeric
**calculated**: false
**description**: Number of bathrooms (used in older scrapes)
**name**: bathrooms_text
**type**: string
**calculated**: false
**description**: Textual description of bathrooms (used in newer scrapes where Airbnb evolved the field from numeric to text)
**name**: bedrooms
**type**: integer
**calculated**: false
**description**: Number of bedrooms
**name**: beds
**type**: integer
**calculated**: false
**description**: Number of beds
**name**: amenities
**type**: json
**calculated**: false
**description**: List of amenities offered
**name**: price
**type**: currency
**calculated**: false
**description**: Daily price in local currency. The $ sign is a technical export artifact and should be ignored.
**name**: minimum_nights
**type**: integer
**calculated**: false
**description**: Minimum nights per stay as set on the listing (calendar rules may differ)
**name**: maximum_nights
**type**: integer
**calculated**: false
**description**: Maximum nights per stay as set on the listing (calendar rules may differ)
**name**: minimum_minimum_nights
**type**: integer
**calculated**: true
**description**: Smallest minimum_night value across the next 365 nights in the calendar
**name**: maximum_minimum_nights
**type**: integer
**calculated**: true
**description**: Largest minimum_night value across the next 365 nights in the calendar
**name**: minimum_maximum_nights
**type**: integer
**calculated**: true
**description**: Smallest maximum_night value across the next 365 nights in the calendar
**name**: maximum_maximum_nights
**type**: integer
**calculated**: true
**description**: Largest maximum_night value across the next 365 nights in the calendar
**name**: minimum_nights_avg_ntm
**type**: numeric
**calculated**: true
**description**: Average minimum_night value across the next 365 nights in the calendar
**name**: maximum_nights_avg_ntm
**type**: numeric
**calculated**: true
**description**: Average maximum_night value across the next 365 nights in the calendar
**name**: calendar_updated
**type**: date
**calculated**: false
**description**: Date the calendar was last updated
**name**: has_availability
**type**: boolean
**calculated**: false
**description**: t=true, f=false
**name**: availability_30
**type**: integer
**calculated**: true
**description**: Number of available days in the next 30 days per the calendar (unavailability may be due to guest booking or host block)
**name**: availability_60
**type**: integer
**calculated**: true
**description**: Number of available days in the next 60 days per the calendar
**name**: availability_90
**type**: integer
**calculated**: true
**description**: Number of available days in the next 90 days per the calendar
**name**: availability_365
**type**: integer
**calculated**: true
**description**: Number of available days in the next 365 days per the calendar
**name**: calendar_last_scraped
**type**: date
**calculated**: false
**description**: Date the listing calendar was last scraped
**name**: number_of_reviews
**type**: integer
**calculated**: false
**description**: Total number of reviews the listing has received
**name**: number_of_reviews_ltm
**type**: integer
**calculated**: true
**description**: Number of reviews in the last 12 months
**name**: number_of_reviews_l30d
**type**: integer
**calculated**: true
**description**: Number of reviews in the last 30 days
**name**: first_review
**type**: date
**calculated**: true
**description**: Date of the oldest review
**name**: last_review
**type**: date
**calculated**: true
**description**: Date of the most recent review
**name**: review_scores_rating
**type**: numeric
**calculated**: false
**description**: Overall review score
**name**: review_scores_accuracy
**type**: numeric
**calculated**: false
**description**: Review score for accuracy
**name**: review_scores_cleanliness
**type**: numeric
**calculated**: false
**description**: Review score for cleanliness
**name**: review_scores_checkin
**type**: numeric
**calculated**: false
**description**: Review score for check-in experience
**name**: review_scores_communication
**type**: numeric
**calculated**: false
**description**: Review score for host communication
**name**: review_scores_location
**type**: numeric
**calculated**: false
**description**: Review score for location
**name**: review_scores_value
**type**: numeric
**calculated**: false
**description**: Review score for value
**name**: license
**type**: text
**calculated**: false
**description**: Licence, permit, or registration number for the listing
**name**: instant_bookable
**type**: boolean
**calculated**: false
**description**: t=true if guests can book without host approval — considered an indicator of a commercial listing
**name**: calculated_host_listings_count
**type**: integer
**calculated**: true
**description**: Number of listings the host has in the current scrape within the city/region geography
**name**: calculated_host_listings_count_entire_homes
**type**: integer
**calculated**: true
**description**: Count of Entire home/apt listings for the host in the current city scrape
**name**: calculated_host_listings_count_private_rooms
**type**: integer
**calculated**: true
**description**: Count of Private room listings for the host in the current city scrape
**name**: calculated_host_listings_count_shared_rooms
**type**: integer
**calculated**: true
**description**: Count of Shared room listings for the host in the current city scrape
**name**: reviews_per_month
**type**: numeric
**calculated**: true
**description**: Average reviews per month over the listing lifetime. Formula: if (scrape_date - first_review) <= 30 days → number_of_reviews; else → number_of_reviews / ((scrape_date - first_review + 1) / (365/12))

## Constraints

- Coordinates use WGS84 projection
- price field includes a $ sign as a technical export artifact — strip it before numeric conversion
- bathrooms (numeric) and bathrooms_text (string) coexist; older scrapes use bathrooms, newer scrapes use bathrooms_text
- availability_x fields count days the listing is open per the calendar — absence of availability may reflect guest bookings OR host blocks, these are not distinguishable in this file
- minimum_nights / maximum_nights reflect listing-level rules; actual calendar rules may differ
- source field only takes two values: 'neighbourhood search' or 'previous scrape'; 'previous scrape' requires confirmation of active availability within the last 65 days
- room_type is constrained to: Entire home/apt | Private room | Shared room | Hotel
- boolean fields are encoded as t (true) / f (false) strings, not native booleans
- reviews_per_month uses a 30-day warm-up threshold before switching to the monthly average formula

## Examples

- Filter commercial hosts: calculated_host_listings_count > 1 AND instant_bookable = 't'
- Compute occupancy proxy: (availability_365 subtracted from 365) gives booked+blocked nights
- Convert price to float: price.str.replace('[$,]', '', regex=True).astype(float)
- Identify high-activity listings: number_of_reviews_ltm > 0 AND reviews_per_month > median
