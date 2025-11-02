import re
from bs4 import BeautifulSoup
import script.scrape.selenium_utils as selenium_utils
import json

BASE_URL = 'https://www.bankofamerica.com'
ALL_CARDS_PATH = BASE_URL + '/credit-cards/#filter'
OUTPUT_PATH = './raw/boa_cards.json'

def scrape_credit_card(url):
    all_cards_page_source = selenium_utils.get_page_source(url, 'allCards')
    if not all_cards_page_source:
        print("Failed to retrieve the page source.")
        return

    all_cards_soup = BeautifulSoup(all_cards_page_source, 'html.parser')

    # Find the credit card information
    cards = all_cards_soup.find('div', id='allCards').find_all('div', class_='row card-info visible')
    results = []
    for card in cards:
        card_name_a_tag = card.find('div', class_='small-12 medium-3 large-2 column card-info-left').find('a', class_='learn')
        card_name = _get_card_name(card_name_a_tag)

        card_summary_div = card.find('div', class_='small-12 medium-9 large-10 column card-details')
        card_annual_fee = _get_card_annual_fee(card_summary_div)

        detail_url = BASE_URL + card_name_a_tag['href'] 
        card_detail_page_source = selenium_utils.get_page_source(detail_url, 'cardDetailsCcModule')
        if not card_detail_page_source:
            print(f"Failed to retrieve the detail page for {card_name}. Skipping.")
            continue
        card_detail_soup = BeautifulSoup(card_detail_page_source, 'html.parser')
        card_rewards, card_apr_text = _get_card_rewards(card_detail_soup) 
        card_img = _get_card_img(card_detail_soup)
            
        results.append({
            "name": card_name,
            "annual_fee": card_annual_fee,
            "apr": card_apr_text,
            "image": card_img,
            "rewards": card_rewards
        })

    # Output to JSON file
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"Output written to {OUTPUT_PATH}")

def _get_card_name(card_name_a_tag):
    if card_name_a_tag:
        span = card_name_a_tag.find('span', class_='ada-hidden')
        
        # Get remaining text and normalize spaces
        card_name = re.sub(r'\s+', ' ', span.get_text()).strip()

        # Remove "credit card" or "card" (case-insensitive, whole words)
        card_name = re.sub(r'\b(credit card|card)\b', '', card_name, flags=re.IGNORECASE).strip()

        # Remove any extra double spaces left behind
        return re.sub(r'\s{2,}', ' ', card_name)
    return 'N/A'

def _get_card_annual_fee(card_summary_div):
    card_annual_fee_div = card_summary_div.find('div', class_='benefits-and-callout-wrapper show-for-medium-up')
    card_annual_fee_p  = card_annual_fee_div.find('p', class_='benefits')
    if card_annual_fee_p:
        for sup in card_annual_fee_p.find_all('sup'):
            sup.decompose()
        
        fee_text = card_annual_fee_p.get_text(strip=True)
        
        # Match number after $ and capture only the number part
        match = re.search(r'\$(\d+(?:\.\d{2})?)', fee_text)
        return match.group(1) if match else '0'  # group(1) = number only, without $
    return 'N/A'

def _get_card_apr(card_summary_div):
    card_apr_div = card_summary_div.find('div', class_='cmp-cardsummary__inner-container--purchase-apr')
    card_apr_p = card_apr_div.find('p')
    if card_apr_p:
        card_apr_text = card_apr_p.get_text(separator=' ' ,strip=True)
        return re.sub(r'\s+', ' ', card_apr_text)  # Normalize spaces
    return 'N/A'



def _get_card_rewards(card_detail_soup):
    info_div = card_detail_soup.find('div', class_='row collapse rates-table-head')
    apr_div = info_div.find(
        lambda tag: tag.name == "div" and tag.find("h3", string=lambda s: s and "Standard APR".lower() in s.lower())
    )
    apr_text_div = apr_div.find('div', class_='row-style-1')
    apr_text = apr_text_div.get_text(separator=' ', strip=True) if apr_text_div else ''
    rewards_content_divs = card_detail_soup.find_all('div', class_='column small-12 feature')
    rewards_dict = {}
    for div in rewards_content_divs:
        outer_div = div.find('div', class_='feature-content')
        pretitle_tag = outer_div.find('h3', class_='roboto-bold')

        if pretitle_tag:
            for sup in pretitle_tag.find_all('sup'):
                sup.decompose()
            pretitle = pretitle_tag.get_text(strip=True)

            for h3 in outer_div.find_all('h3'):
                h3.decompose()
            
            inner_text = outer_div.get_text(separator=' ', strip=True) if outer_div else ''
            exclusion_text_set = {'no annual fee', 'ficoscore', 'deposit', 'security deposit', 'learn more about credit', 'no foreign transaction fees', 'no annual feeand no foreign transaction fees'}
            if pretitle.lower() in exclusion_text_set:
                pass
            elif "Bank of America Preferred Rewards" in inner_text:
                pass
            else:
                rewards_dict[pretitle] = inner_text
    return rewards_dict, apr_text


def _get_card_img(card_detail_soup):
    card_img = card_detail_soup.find('div', class_='row small-collapse').find('div', class_='column').find('div', id='productEngagementCcModule').find('img', class_='card-image small-centered')
    if card_img and card_img.has_attr('src'):
        return BASE_URL + card_img['src']
    return 'N/A'

if __name__ == "__main__":
    url = ALL_CARDS_PATH
    scrape_credit_card(url)