import requests
import re
from bs4 import BeautifulSoup
import json

BASE_URL = 'https://creditcards.chase.com'
ALL_CARDS_PATH = BASE_URL + '/all-credit-cards'
OUTPUT_PATH = './raw/chase_cards.json'

def scrape_credit_card(url):
    try:
        response = requests.get(url)
        response.raise_for_status()  # Check for HTTP errors
    except requests.RequestException as e:
        print(f"Error fetching the URL: {e}")
        return None

    soup = BeautifulSoup(response._content, 'html.parser')

    # Find the credit card information
    personal_cards_div = soup.find('div', class_='cmp-cardsummary--list-view--personal')
    cards = personal_cards_div.find_all('div', class_='cmp-cardsummary__inner-container')
    results = []
    for card in cards:
        card_name_a_tag = card.find('a', class_='chaseanalytics-track-link')
        card_name = _get_card_name(card_name_a_tag)

        card_summary_div = card.find('div', class_='cmp-cardsummary__inner-container--summary')
        card_annual_fee = _get_card_annual_fee(card_summary_div)
        card_apr = _get_card_apr(card_summary_div)
        card_img = _get_card_img(card)
        card_rewards = _get_card_rewards(card_name_a_tag) 
            
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

def _get_card_annual_fee(card_summary_div):
    card_annual_fee_div = card_summary_div.find('div', class_='cmp-cardsummary__inner-container--annual-fee')
    card_annual_fee_p  = card_annual_fee_div.find('p')
    if card_annual_fee_p:
        for sup in card_annual_fee_p.find_all('sup'):
            sup.decompose()
        
        fee_text = card_annual_fee_p.get_text(strip=True)
        
        # Match number after $ and capture only the number part
        match = re.search(r'\$(\d+(?:\.\d{2})?)', fee_text)
        return match.group(1) if match else 'N/A'  # group(1) = number only, without $
    return 'N/A'

def _get_card_apr(card_summary_div):
    card_apr_div = card_summary_div.find('div', class_='cmp-cardsummary__inner-container--purchase-apr')
    card_apr_p = card_apr_div.find('p')
    if card_apr_p:
        card_apr_text = card_apr_p.get_text(separator=' ' ,strip=True)
        return re.sub(r'\s+', ' ', card_apr_text)  # Normalize spaces
    return 'N/A'



def _get_card_rewards(card_name_a_tag):
    if card_name_a_tag and card_name_a_tag.has_attr('href'):
        href = card_name_a_tag['href']
        # Remove the iCELL parameter from the URL
        href = BASE_URL + re.sub(r'\?iCELL=[^&]*', '', href) 

        
        try:
            response = requests.get(href)
            response.raise_for_status()  # Check for HTTP errors
        except requests.RequestException as e:
            print(f"Error fetching the URL: {e}")
            return {}
    
        #time.sleep(0.5)  # Sleep to avoid overwhelming the server
        rewards_soup = BeautifulSoup(response.content, 'html.parser')
        rewards_content_divs = rewards_soup.find_all('div', class_='cmp-rewardsbenefits__content')
        rewards_dict = {}
        for div in rewards_content_divs:
            pretitle_tag = div.find('h3', class_='cmp-rewardsbenefits__pretitle')
            title_tag = div.find('h4', class_='cmp-rewardsbenefits__title')
            inner_div = div.find('div')
            if pretitle_tag:
                pretitle = pretitle_tag.get_text(strip=True)
                title = title_tag.get_text(strip=True) if title_tag else ''
                inner_text = inner_div.get_text(separator=' ', strip=True) if inner_div else ''
                combined = f"{title} {inner_text}".strip()
                rewards_dict[pretitle] = combined
        return rewards_dict
    return {}


def _get_card_img(card_summary_div):
    card_img = card_summary_div.find('img', class_='img-fluid')
    if card_img and card_img.has_attr('src'):
        return BASE_URL + card_img['src']
    return 'N/A'

if __name__ == "__main__":
    url = ALL_CARDS_PATH
    scrape_credit_card(url)