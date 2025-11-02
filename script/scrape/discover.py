import re
from bs4 import BeautifulSoup
import selenium_utils as selenium_utils
import json

BASE_URL = 'https://www.discover.com'
ALL_CARDS_PATH = BASE_URL + '/credit-cards'
OUTPUT_PATH = './raw/discover_cards.json'

def scrape_credit_card(url):
    all_cards_page_source = selenium_utils.get_page_source(url, 'cchp-tab', use_undetected=True, scroll_to_bottom=True)
    if not all_cards_page_source:
        print("Failed to retrieve the page source.")
        return

    soup = BeautifulSoup(all_cards_page_source, 'html.parser')

    # Find the credit card information
    personal_cards_div = soup.find('div', class_='dfsCardWrapper CCHPVariation-2')
    #print("Personal Cards Div:", personal_cards_div.prettify())
    cards = personal_cards_div.find_all('div', class_='dfscontainer')
    results = []
    for card in cards:
        card_name_a_tag = card.find('a', class_='cmp-button cmp-link-blue-font')
        card_name = _get_card_name(card_name_a_tag)

        card_summary_div = card.find('div', class_='cf-list__items carousel-items cf-list__items--lg-stacked cf-list__items--sm-stacked cf-list__items--2-col')
        card_annual_fee = 0

        card_apr_div = card.find('div', class_='cards-information cards-information--third-inner')
        card_rewards = _get_card_rewards(card_summary_div) 

        card_img_div = card.find('div', class_='cmp-image')
        card_img = _get_card_img(card_img_div)

        card_apr = _get_card_apr(card_apr_div)
            
        results.append({
            "name": card_name,
            "annual_fee": card_annual_fee,
            "apr": card_apr,
            "image": card_img,
            "rewards": card_rewards
        })

    # Output to JSON file
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"Output written to {OUTPUT_PATH}")

def _get_card_name(card_name_a_tag):
    if card_name_a_tag:
        # Remove all <span> tags from inside <a>
        for span in card_name_a_tag.find_all('span'):
            span.decompose()
        
        # Get remaining text and normalize spaces
        card_name = re.sub(r'\s+', ' ', card_name_a_tag.get_text()).strip()

        # Remove "credit card" or "card" (case-insensitive, whole words)
        card_name = re.sub(r'\b(credit card|card)\b', '', card_name, flags=re.IGNORECASE).strip()

        # Remove any extra double spaces left behind
        return re.sub(r'\s{2,}', ' ', card_name)
    return 'N/A'

def _get_card_apr(card_summary_div):
    card_apr_div = card_summary_div.find('div', class_='cmp-text cmp-text-d-medium cmp-text-mt-medium cmp-text-small-font')
    card_apr_p = card_apr_div.find('p')
    if card_apr_p:
        #for span in card_apr_p.find_all('span'):
        #    span.decompose()
            
        card_apr_text = card_apr_p.get_text(separator=' ' ,strip=True)
        return re.sub(r'\s+', ' ', card_apr_text)  # Normalize spaces
    return 'N/A'



def _get_card_rewards(card_summary_div):
    if card_summary_div:
        rewards_content_divs = card_summary_div.find('div', class_='cf-text-cchp')
        reward_ps = rewards_content_divs.find_all('p', class_='cchpBorderBtm')
        rewards_dict = {}
        count=0
        for reward in reward_ps:
            inner_text = reward.get_text(separator=' ', strip=True)
            rewards_dict[count] = inner_text
            count += 1
        return rewards_dict
    return {}


def _get_card_img(card_img_div):
    card_img = card_img_div.find('img')
    if card_img and card_img.has_attr('data-src'):
        return BASE_URL + card_img['data-src']
    return 'N/A'

if __name__ == "__main__":
    url = ALL_CARDS_PATH
    scrape_credit_card(url)