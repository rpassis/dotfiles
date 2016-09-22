class UserViewModel < BaseViewModel

  delegate :full_name, :email, :status, :instagram_id, :instagram_username, :instagram_access_token, :instagram_profile_picture_url, :instagram_media_count, :instagram_follows_count,
           :instagram_followers_count, :mobile_phone, :trading_name, :trading_type, :trading_number, :account_name, :account_number, :account_bsb,
           to: :@resource

  def date_of_birth
    if dob = @resource.date_of_birth
      dob.to_formatted_s
    end
  end

  def admin
    @resource.admin?
  end

  def addresses
    results = []
    @resource.addresses.each { |a| results << AddressViewModel.new(a) }
    results
  end

  def subscription
    SubscriptionViewModel.new(@resource.subscription) if @resource.subscription.present?
  end

  def wallet_balance
    user.wallet.balance if @resource.wallet.present?
  end

end
